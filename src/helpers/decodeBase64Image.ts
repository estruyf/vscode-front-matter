export const decodeBase64 = (dataString: string) => {
  const dataParts = dataString.split(';base64,');

  if (dataParts?.length < 2) {
    return null;
  }

  const typePart = dataParts[0].split(':').pop() as string;
  const dataPart = dataParts.pop() as string;

  const response: any = {};

  response.type = typePart;
  response.data = Buffer.from(dataPart, 'base64');

  return response;
};
