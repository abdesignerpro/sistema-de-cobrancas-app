import axios from 'axios';

interface QRCodeData {
  nome: string;
  cidade: string;
  valor: string;
  chavePix: string;
  pixId: string;
}

interface MessageData {
  number: string;
  message: string;
}

// Função para gerar QR Code PIX
export const generateQRCode = async (data: QRCodeData) => {
  try {
    const response = await axios.get('https://gerarqrcodepix.com.br/api/v1', {
      params: {
        nome: data.nome,
        cidade: data.cidade,
        valor: data.valor,
        saida: 'br',
        chave: data.chavePix,
        txid: data.pixId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
};

// Função para enviar mensagem automática via Evolution API
export const sendAutomaticMessage = async (
  instanceName: string,
  data: MessageData,
  apiKey: string,
  apiUrl: string
) => {
  try {
    const response = await axios.post(
      `${apiUrl}/message/sendText/${instanceName}`,
      {
        number: data.number,
        options: {
          delay: 1200,
          presence: 'composing',
        },
        textMessage: {
          text: data.message,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};
