FROM r-base:latest

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    zlib1g-dev \
    wget \
    sudo \
    pandoc \
    libcurl4-gnutls-dev \
    libcairo2-dev \
    libxt-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://www.python.org/ftp/python/3.8.10/Python-3.8.10.tgz \
    && tar -xzf Python-3.8.10.tgz \
    && cd Python-3.8.10 \
    && ./configure --enable-optimizations --enable-shared --prefix=/usr/local \
    && make -j 8 \
    && make altinstall

ENV LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
ENV SHINY_ENVIRONMENT=production

RUN python3.8 -m venv /opt/venv
RUN /opt/venv/bin/pip install python-chess

RUN R -e "install.packages(\
c('magrittr','shiny', 'remotes', 'reticulate', 'httr', 'shinythemes', 'igraph', 'yaml', 'stringr', 'ggplot2'), \
repos='https://cloud.r-project.org/')"
RUN R -e "install.packages(\
c('DT'), \
repos='https://cloud.r-project.org/')"
RUN R -e "reticulate::use_virtualenv('/opt/venv', required = TRUE)"

COPY . /srv/shiny-server/
COPY startup.sh /usr/local/bin/

RUN chmod -R 755 /srv/shiny-server \
    && chmod +x /usr/local/bin/startup.sh

WORKDIR /srv/shiny-server
EXPOSE 3838

ENTRYPOINT ["/usr/local/bin/startup.sh"]
CMD ["Rscript", "-e", "library(reticulate); \
    use_virtualenv('/opt/venv', required = TRUE); \
    library(shiny); \
    shiny::runApp(host='0.0.0.0', port=3838, launch.browser = FALSE)"]

