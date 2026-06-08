# Usa imagem Python 3.10 slim
FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema necessárias se houver
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de requisitos e instala pacotes Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código da aplicação
COPY app/ ./app/
COPY tests/ ./tests/

# Define porta exposta
EXPOSE 8000

# Executa os testes automatizados pytest e, se passarem, inicia o servidor Uvicorn
CMD ["sh", "-c", "pytest && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
