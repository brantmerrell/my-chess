FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libgl1-mesa-dev \
    libpng-dev \
    libwebp-dev \
    libboost-dev \
    default-jre

RUN git clone https://github.com/ArthurSonzogni/Diagon.git && \
    cd Diagon && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make && \
    chmod +x diagon

ENV PATH="/app/Diagon/build:${PATH}"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
