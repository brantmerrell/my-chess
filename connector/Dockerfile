FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Build diagon from source for any architecture
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    g++ \
    && git clone https://github.com/ArthurSonzogni/Diagon.git \
    && cd Diagon \
    && cmake . \
    && make \
    && make install \
    && cd .. \
    && rm -rf Diagon \
    && apt-get remove -y git cmake g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
