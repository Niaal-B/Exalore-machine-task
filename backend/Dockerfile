FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HOME=/tmp

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .
RUN DJANGO_SECRET_KEY=collectstatic-build-key python manage.py collectstatic --noinput

RUN mkdir -p /app/media \
    && addgroup --system django && adduser --system --home /home/django --ingroup django django \
    && chown -R django:django /app
USER django

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py setup_initial_data && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2} --timeout 120"]
