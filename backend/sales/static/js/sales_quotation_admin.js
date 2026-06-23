window.addEventListener("DOMContentLoaded", function () {
    if (typeof django === "undefined" || !django.jQuery) {
        return;
    }

    var $ = django.jQuery;

    function parseDecimal(value) {
        var num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    function calculateRowTotals(rowIdPrefix) {
        var quantity = parseDecimal($("#id_" + rowIdPrefix + "-quantity").val());
        var rate = parseDecimal($("#id_" + rowIdPrefix + "-rate").val());
        var discountPercentage = parseDecimal($("#id_" + rowIdPrefix + "-discount_percentage").val());
        var vatPercentage = parseDecimal($("#id_" + rowIdPrefix + "-vat_percentage").val());

        var grossAmount = quantity * rate;
        var discountAmount = grossAmount * (discountPercentage / 100.0);
        var netAmount = grossAmount - discountAmount;
        var vatAmount = netAmount * (vatPercentage / 100.0);
        var netAfterVat = netAmount + vatAmount;

        // Set values rounded to 4 decimals
        $("#id_" + rowIdPrefix + "-discount_amount").val(discountAmount.toFixed(4));
        $("#id_" + rowIdPrefix + "-vat_amount").val(vatAmount.toFixed(4));
        $("#id_" + rowIdPrefix + "-net_amount").val(netAmount.toFixed(4));
        $("#id_" + rowIdPrefix + "-net_after_vat").val(netAfterVat.toFixed(4));

        calculateDocumentTotals();
    }

    function calculateDocumentTotals() {
        var totalGross = 0;
        var totalDiscount = 0;
        var totalNet = 0;
        var totalVat = 0;
        var totalNetAfterVat = 0;

        // Iterate over all active lines
        $("tr.dynamic-lines:not(.deleted)").each(function () {
            var $row = $(this);
            // Ignore the empty template row used by Django
            if ($row.attr('id') === 'lines-empty') return;
            // Ensure the item_unit is selected, or skip
            var itemUnitId = $row.find("select[id$='-item_unit']").val();
            if (!itemUnitId) return;

            var quantity = parseDecimal($row.find("input[id$='-quantity']").val());
            var rate = parseDecimal($row.find("input[id$='-rate']").val());
            
            var rowGross = quantity * rate;
            var discountPercentage = parseDecimal($row.find("input[id$='-discount_percentage']").val());
            var vatPercentage = parseDecimal($row.find("input[id$='-vat_percentage']").val());

            var rowDiscount = rowGross * (discountPercentage / 100.0);
            var rowNet = rowGross - rowDiscount;
            var rowVat = rowNet * (vatPercentage / 100.0);
            var rowTotal = rowNet + rowVat;

            totalGross += rowGross;
            totalDiscount += rowDiscount;
            totalNet += rowNet;
            totalVat += rowVat;
            totalNetAfterVat += rowTotal;
        });

        // Set values on the main form
        $("#id_gross_amount").val(totalGross.toFixed(4));
        $("#id_discount_amount").val(totalDiscount.toFixed(4));
        $("#id_net_amount").val(totalNet.toFixed(4));
        $("#id_vat_amount").val(totalVat.toFixed(4));
        $("#id_net_after_vat").val(totalNetAfterVat.toFixed(4));
    }

    // Use event delegation for dynamic inline rows
    $(document).on("change", "select[id$='-item_unit']", function () {
        var $select = $(this);
        var itemUnitId = $select.val();
        var rowIdPrefix = $select.attr("id").replace("id_", "").replace("-item_unit", "");

        if (!itemUnitId) {
            return; // Empty selection
        }

        // Fetch pricing
        $.ajax({
            url: "/admin/sales/salesquotation/get-item-unit-pricing/",
            data: { id: itemUnitId },
            success: function (data) {
                if (data.sale_price) {
                    $("#id_" + rowIdPrefix + "-rate").val(parseFloat(data.sale_price).toFixed(4));
                }
                if (data.vat_percentage) {
                    $("#id_" + rowIdPrefix + "-vat_percentage").val(parseFloat(data.vat_percentage).toFixed(4));
                }
                // Trigger recalculation
                calculateRowTotals(rowIdPrefix);
            },
            error: function (err) {
                console.error("Failed to fetch item unit pricing:", err);
            }
        });
    });

    // Listen to changes on fields that affect calculation
    $(document).on("input change", "input[id$='-quantity'], input[id$='-rate'], input[id$='-discount_percentage']", function () {
        var fieldId = $(this).attr("id");
        if (!fieldId) return;

        // Extract prefix like lines-0
        var match = fieldId.match(/^id_(lines-\d+)-/);
        if (match && match[1]) {
            calculateRowTotals(match[1]);
        }
    });
});
