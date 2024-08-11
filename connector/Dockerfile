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

# Clone the repository
RUN git clone https://github.com/ArthurSonzogni/Diagon.git

# Add the missing include directive
RUN sed -i '2i#include <memory>' Diagon/src/translator/graph_planar/GraphPlanarEmpty.cpp

# Build the project
RUN cd Diagon && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make && \
    chmod +x diagon

ENV PATH="/app/Diagon/build:${PATH}"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN g++ --version

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

