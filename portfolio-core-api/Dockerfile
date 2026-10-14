# Usar una imagen oficial de Python ligera
FROM python:3.11-slim

# Evitar que Python genere archivos .pyc y forzar la salida estándar
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Crear y movernos al directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar ciertas librerías
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar las dependencias de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY . /app/