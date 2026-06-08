import logging
import os
import sys

# Define o formato estruturado para logs de auditoria
LOG_FORMAT = "[%(asctime)s] - %(levelname)s - EVENT: %(event_type)s - RESOURCE_ID: %(resource_id)s - DETAILS: %(message)s"

class AuditFormatter(logging.Formatter):
    """
    Formatter customizado para garantir que as chaves 'event_type' e 'resource_id'
    estejam sempre presentes ou tenham valores padrão.
    """
    def format(self, record):
        if not hasattr(record, "event_type"):
            record.event_type = "GENERAL"
        if not hasattr(record, "resource_id"):
            record.resource_id = "N/A"
        return super().format(record)

def setup_audit_logging():
    logger = logging.getLogger("audit_logger")
    logger.setLevel(logging.INFO)

    # Evita duplicar logs se já configurado
    if logger.handlers:
        return logger

    # Cria o diretório de logs se não existir
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Handler para console (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Handler para arquivo local
    file_handler = logging.FileHandler(os.path.join(log_dir, "audit.log"), encoding="utf-8")
    file_handler.setLevel(logging.INFO)

    # Configura formatador
    formatter = AuditFormatter(LOG_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger

# Inicializa o logger
audit_logger = setup_audit_logging()

def log_audit(event_type: str, resource_id: str, message: str, level: int = logging.INFO):
    """
    Função auxiliar para registrar logs de auditoria de forma limpa no código.
    """
    audit_logger.log(
        level,
        message,
        extra={"event_type": event_type, "resource_id": str(resource_id)}
    )
