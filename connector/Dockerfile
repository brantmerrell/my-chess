FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install diagon - use pre-built for amd64 (Heroku's architecture)
# or build from source if not available
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        wget https://github.com/ArthurSonzogni/Diagon/releases/download/v1.1.158/diagon-1.1.156-Linux.deb && \
        dpkg -i diagon-1.1.156-Linux.deb && \
        rm diagon-1.1.156-Linux.deb; \
    else \
        apt-get update && apt-get install -y git cmake g++ && \
        git clone https://github.com/ArthurSonzogni/Diagon.git && \
        cd Diagon && \
        cmake . && \
        make -j$(nproc) && \
        make install && \
        cd .. && \
        rm -rf Diagon && \
        apt-get remove -y git cmake g++ && \
        apt-get autoremove -y && \
        rm -rf /var/lib/apt/lists/*; \
    fi

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
