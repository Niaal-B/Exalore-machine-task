from django.db import transaction
from rest_framework import serializers

from .models import Item, ItemPrice, ItemUnit


class ItemPriceSerializer(serializers.ModelSerializer):
    # Writable IDs let parent serializers reconcile existing nested rows.
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ItemPrice
        fields = (
            "id",
            "item_unit",
            "price_list_type",
            "sale_price",
            "minimum_selling_price",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("item_unit", "created_at", "updated_at")

    def validate(self, attrs):
        sale_price = attrs.get(
            "sale_price",
            getattr(self.instance, "sale_price", None),
        )
        minimum_price = attrs.get(
            "minimum_selling_price",
            getattr(self.instance, "minimum_selling_price", None),
        )

        if (
            sale_price is not None
            and minimum_price is not None
            and minimum_price > sale_price
        ):
            raise serializers.ValidationError(
                {
                    "minimum_selling_price": (
                        "Minimum selling price cannot exceed sale price."
                    )
                }
            )

        return attrs


class ItemUnitSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    prices = ItemPriceSerializer(many=True, required=False)
    deleted_price_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        write_only=True,
        default=list,
    )

    class Meta:
        model = ItemUnit
        fields = (
            "id",
            "unit",
            "co_factor",
            "barcode",
            "prices",
            "deleted_price_ids",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
        # Nested serializers are not bound to their existing instances during
        # validation, so barcode uniqueness is checked by ItemSerializer.
        extra_kwargs = {"barcode": {"validators": []}}

    def validate_prices(self, prices):
        price_types = [price["price_list_type"].strip().casefold() for price in prices]
        if len(price_types) != len(set(price_types)):
            raise serializers.ValidationError(
                "A unit cannot contain duplicate price list types."
            )

        ids = [price["id"] for price in prices if "id" in price]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Duplicate price IDs are not allowed.")

        return prices

    def validate(self, attrs):
        prices = attrs.get("prices", [])
        deleted_ids = attrs.get("deleted_price_ids", [])

        if len(deleted_ids) != len(set(deleted_ids)):
            raise serializers.ValidationError(
                {"deleted_price_ids": "Duplicate deletion IDs are not allowed."}
            )

        supplied_ids = {price["id"] for price in prices if "id" in price}
        overlap = supplied_ids.intersection(deleted_ids)
        if overlap:
            raise serializers.ValidationError(
                {"deleted_price_ids": f"Price IDs cannot be updated and deleted: {sorted(overlap)}."}
            )

        return attrs

    def create_for_item(self, item, validated_data):
        prices_data = validated_data.pop("prices", [])
        deleted_ids = validated_data.pop("deleted_price_ids", [])
        if deleted_ids:
            raise serializers.ValidationError(
                {"deleted_price_ids": "Prices cannot be deleted during unit creation."}
            )

        item_unit = ItemUnit.objects.create(item=item, **validated_data)
        self._sync_prices(item_unit, prices_data, deletion_ids=set())
        return item_unit

    def update(self, instance, validated_data):
        prices_data = validated_data.pop("prices", None)
        deleted_ids = set(validated_data.pop("deleted_price_ids", []))
        instance = super().update(instance, validated_data)

        if prices_data is not None or deleted_ids:
            self._sync_prices(instance, prices_data or [], deleted_ids)

        return instance

    @staticmethod
    def _sync_prices(item_unit, prices_data, deletion_ids):
        existing = {price.pk: price for price in item_unit.prices.all()}
        supplied_ids = {
            price_data["id"] for price_data in prices_data if "id" in price_data
        }
        unknown_ids = supplied_ids.union(deletion_ids) - existing.keys()
        if unknown_ids:
            raise serializers.ValidationError(
                {"prices": f"Unknown price IDs for this unit: {sorted(unknown_ids)}."}
            )

        type_owners = {
            price.price_list_type.strip().casefold(): price.pk
            for price in existing.values()
        }
        for price_data in prices_data:
            price_id = price_data.get("id")
            normalized_type = price_data["price_list_type"].strip().casefold()
            owner_id = type_owners.get(normalized_type)
            if (
                owner_id is not None
                and owner_id != price_id
                and owner_id not in deletion_ids
            ):
                raise serializers.ValidationError(
                    {"prices": f"Price list type already exists: {price_data['price_list_type']}."}
                )

        if deletion_ids:
            item_unit.prices.filter(pk__in=deletion_ids).delete()

        for price_data in prices_data:
            payload = price_data.copy()
            price_id = payload.pop("id", None)
            if price_id is None:
                ItemPrice.objects.create(item_unit=item_unit, **payload)
                continue

            price = existing[price_id]
            for field, value in payload.items():
                setattr(price, field, value)
            price.save()


class ItemSerializer(serializers.ModelSerializer):
    units = ItemUnitSerializer(many=True, required=False)
    deleted_unit_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        write_only=True,
        default=list,
    )

    class Meta:
        model = Item
        fields = (
            "id",
            "code",
            "name",
            "secondary_name",
            "generic_name",
            "description",
            "behaviour",
            "group_code",
            "status",
            "tax_status",
            "shelf_code",
            "manufacturer",
            "image",
            "units",
            "deleted_unit_ids",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_units(self, units):
        unit_names = [unit["unit"].strip().casefold() for unit in units]
        if len(unit_names) != len(set(unit_names)):
            raise serializers.ValidationError(
                "An item cannot contain duplicate unit names."
            )

        ids = [unit["id"] for unit in units if "id" in unit]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Duplicate unit IDs are not allowed.")

        if self.instance is None and ids:
            raise serializers.ValidationError(
                "Existing unit IDs cannot be supplied when creating an item."
            )

        if self.instance is not None:
            existing_ids = set(self.instance.units.values_list("id", flat=True))
            unknown_ids = set(ids) - existing_ids
            if unknown_ids:
                raise serializers.ValidationError(
                    f"Unknown unit IDs for this item: {sorted(unknown_ids)}."
                )

            name_owners = {
                item_unit.unit.strip().casefold(): item_unit.pk
                for item_unit in self.instance.units.all()
            }
            conflicting_names = [
                unit["unit"]
                for unit in units
                if name_owners.get(unit["unit"].strip().casefold())
                not in (None, unit.get("id"))
            ]
            if conflicting_names:
                raise serializers.ValidationError(
                    "Unit names already belong to other retained units: "
                    f"{sorted(conflicting_names)}."
                )

        barcodes = [unit["barcode"] for unit in units if unit.get("barcode")]
        if len(barcodes) != len(set(barcodes)):
            raise serializers.ValidationError(
                "Duplicate barcodes are not allowed within an item."
            )

        barcode_owners = dict(
            ItemUnit.objects.filter(barcode__in=barcodes).values_list(
                "barcode", "id"
            )
        )
        conflicting_barcodes = sorted(
            unit["barcode"]
            for unit in units
            if unit.get("barcode")
            and barcode_owners.get(unit["barcode"]) not in (None, unit.get("id"))
        )
        if conflicting_barcodes:
            raise serializers.ValidationError(
                f"Barcodes already in use: {conflicting_barcodes}."
            )

        return units

    def validate(self, attrs):
        units = attrs.get("units", [])
        deleted_ids = attrs.get("deleted_unit_ids", [])

        if len(deleted_ids) != len(set(deleted_ids)):
            raise serializers.ValidationError(
                {"deleted_unit_ids": "Duplicate deletion IDs are not allowed."}
            )

        supplied_ids = {unit["id"] for unit in units if "id" in unit}
        overlap = supplied_ids.intersection(deleted_ids)
        if overlap:
            raise serializers.ValidationError(
                {"deleted_unit_ids": f"Unit IDs cannot be updated and deleted: {sorted(overlap)}."}
            )

        if self.instance is None and deleted_ids:
            raise serializers.ValidationError(
                {"deleted_unit_ids": "Units cannot be deleted during item creation."}
            )
        elif self.instance is not None:
            existing_ids = set(self.instance.units.values_list("id", flat=True))
            unknown_ids = set(deleted_ids) - existing_ids
            if unknown_ids:
                raise serializers.ValidationError(
                    {"deleted_unit_ids": f"Unknown unit IDs: {sorted(unknown_ids)}."}
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        units_data = validated_data.pop("units", [])
        validated_data.pop("deleted_unit_ids", None)
        item = Item.objects.create(**validated_data)

        unit_serializer = ItemUnitSerializer(context=self.context)
        for unit_data in units_data:
            unit_serializer.create_for_item(item, unit_data.copy())

        return item

    @transaction.atomic
    def update(self, instance, validated_data):
        units_data = validated_data.pop("units", None)
        deleted_ids = set(validated_data.pop("deleted_unit_ids", []))
        locked_item = Item.objects.select_for_update().get(pk=instance.pk)
        instance = super().update(locked_item, validated_data)

        if units_data is not None or deleted_ids:
            self._sync_units(instance, units_data or [], deleted_ids)

        return instance

    def _sync_units(self, item, units_data, deletion_ids):
        existing = {item_unit.pk: item_unit for item_unit in item.units.all()}
        supplied_ids = {
            unit_data["id"] for unit_data in units_data if "id" in unit_data
        }

        # Ownership is checked during validation; this remains a defensive
        # guard for direct calls to update().
        unknown_ids = supplied_ids.union(deletion_ids) - existing.keys()
        if unknown_ids:
            raise serializers.ValidationError(
                {"units": f"Unknown unit IDs for this item: {sorted(unknown_ids)}."}
            )

        if deletion_ids:
            item.units.filter(pk__in=deletion_ids).delete()

        unit_serializer = ItemUnitSerializer(context=self.context)
        for unit_data in units_data:
            payload = unit_data.copy()
            unit_id = payload.pop("id", None)
            if unit_id is None:
                unit_serializer.create_for_item(item, payload)
            else:
                unit_serializer.update(existing[unit_id], payload)
