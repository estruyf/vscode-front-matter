export const decodeBase64Image = (dataString: string) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let response: any = {};

  if (matches?.length !== 3) {
    return null;
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
}
