function formatField(id, value) {
  const length = String(value.length).padStart(2, "0");
  return id + length + value;
}

function buildPayload(amount, pixKey, recipientName, city) {
  const accountData =
    formatField("00", "br.gov.bcb.pix") + formatField("01", pixKey);

  let payload =
    formatField("00", "01") +
    formatField("01", "11") +
    formatField("26", accountData) +
    formatField("52", "0000") +
    formatField("53", "986");

  if (amount !== "") {
    payload += formatField("54", Number(amount).toFixed(2));
  }

  payload +=
    formatField("58", "BR") +
    formatField("59", recipientName) +
    formatField("60", city) +
    formatField("62", formatField("05", "***"));

  return payload + "6304";
}

function crc16(text) {
  let crc = 0xffff;
  const bytes = new TextEncoder().encode(text);

  for (const byte of bytes) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const form = document.getElementById("pix-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const pixKey = document.getElementById("pix-key").value;
  const recipientName = document.getElementById("recipient-name").value;
  const city = document.getElementById("city").value;

  const payload = buildPayload(amount, pixKey, recipientName, city);
  const pixCode = payload + crc16(payload);
  const qrcodeDiv = document.getElementById("qrcode");

  qrcodeDiv.innerHTML = "";
  new QRCode(qrcodeDiv, pixCode);

  document.getElementById("pix-code").value = pixCode;
});
