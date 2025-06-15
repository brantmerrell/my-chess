FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download and install pre-built diagon .deb package
RUN wget https://github.com/ArthurSonzogni/Diagon/releases/download/v1.1.158/diagon-1.1.156-Linux.deb && \
    dpkg -i diagon-1.1.156-Linux.deb || apt-get install -f -y && \
    diagon --version && \
    rm diagon-1.1.156-Linux.deb

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
