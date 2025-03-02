import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const generatePdf = async (selectedInvoice, formatCurrency) => {
  if (!selectedInvoice) {
    alert("Tidak ada invoice yang dipilih!");
    return;
  }

  // Inisialisasi jsPDF dengan ukuran A4
  const doc = new jsPDF({
    orientation: "portrait", // Orientasi portrait (default)
    unit: "mm", // Satuan milimeter
    format: "a4", // Ukuran kertas A4
  });

  const margin = 20; // Margin kiri dan kanan
  const pageHeight = doc.internal.pageSize.height; // Tinggi halaman A4 (297 mm)
  const marginBottom = 20; // Margin bawah
  const maxY = pageHeight - marginBottom; // Batas maksimum posisi Y
  let startY = 10; // Posisi awal untuk menulis data

  const logoUrl = "/logo.jpeg"; // Ganti dengan path atau URL logo
  const marginLogo = 15; // Margin kiri untuk logo
  const newWidth = 75; // Lebar logo yang diinginkan

  // Dimensi asli logo (ganti dengan dimensi asli logo Anda)
  const originalWidth = 300;
  const originalHeight = 100;
  const aspectRatio = originalWidth / originalHeight;
  const newHeight = newWidth / aspectRatio;

  // Tambahkan logo ke PDF
  doc.addImage(logoUrl, "jpeg", marginLogo, 20, newWidth, newHeight);

  // Fungsi untuk menambahkan teks dengan pengecekan batas halaman
  const addText = (
    text,
    x,
    y,
    fontSize = 10,
    fontStyle = "normal",
    lineHeight = 7
  ) => {
    if (y > maxY) {
      doc.addPage();
      y = margin; // Reset posisi Y ke margin atas
    }
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.text(text, x, y);
    return y + lineHeight; // Kembalikan posisi Y baru
  };

  // Header (Alamat dan Kontak di pojok kanan)
  const addressX = doc.internal.pageSize.width - margin - 40;
  let headerY = 20;
  headerY = addText("JL. Sanggar No 31-33", addressX, headerY, 10);
  headerY = addText("Surabaya (60175)", addressX, headerY, 10);
  headerY = addText("Telp. : +6231-73690229", addressX, headerY, 10);
  headerY = addText("Fax. : +6231-3576864", addressX, headerY, 10);
  headerY = addText("INDONESIA", addressX, headerY, 10);

  // Tambahkan garis horizontal di bawah header
  doc.setLineWidth(0.5);
  doc.line(
    margin,
    headerY + 5,
    doc.internal.pageSize.width - margin,
    headerY + 5
  );

  // Judul Invoice (Ditempatkan di tengah)
  const invoiceTitle = "Invoice";
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const textWidth = doc.getTextWidth(invoiceTitle);
  const centerX = (doc.internal.pageSize.width - textWidth) / 2;
  startY = headerY + 15;
  doc.text(invoiceTitle, centerX, startY);

  // Bill To dan Invoice Details
  const billToX = margin; // Posisi X untuk Bill To
  const invoiceDetailsX = 110; // Posisi X untuk Invoice Details

  startY = addText("Bill To:", billToX, startY + 10, 10, "bold");
  startY = addText(
    selectedInvoice.client_name.toUpperCase(),
    billToX,
    startY,
    10
  );
  startY = addText(
    selectedInvoice.client_address.toUpperCase(),
    billToX,
    startY,
    10
  );

  // Format tanggal menggunakan fungsi utilitas
  const formattedDate = formatDate(selectedInvoice.invoice_date);

  startY = addText(
    "Invoice Number: " + selectedInvoice.invoice_number.toUpperCase(),
    invoiceDetailsX,
    startY - 14,
    10
  );
  startY = addText("Date: " + formattedDate, invoiceDetailsX, startY, 10);
  startY = addText("Terms: CASH ONLY", invoiceDetailsX, startY, 10);
  startY += 7;

  // Informasi tambahan
  startY = addText(
    "Forwarding Vessel: " + selectedInvoice.forwarding_vessel.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Port Of Discharge: " + selectedInvoice.port_of_discharge.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Port Of Loading: " + selectedInvoice.port_of_loading.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Bill Lading: " + selectedInvoice.bill_lading.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Shipper: " + selectedInvoice.shipper.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Consignee: " + selectedInvoice.consignee.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Measurement: " + selectedInvoice.measurement.toUpperCase(),
    margin,
    startY,
    10
  );
  startY = addText(
    "Cargo Description: " + selectedInvoice.cargo_description.toUpperCase(),
    margin,
    startY,
    10
  );

  // ETD dan ETA
  const formattedETD = formatDate(selectedInvoice.etd);
  const formattedETA = formatDate(selectedInvoice.eta);
  startY = addText(
    `ETD/ETA: ${formattedETD} / ${formattedETA}`,
    margin,
    startY,
    10
  );
  // startY += 7;

  // Tabel Charges
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    if (startY > maxY) {
      doc.addPage();
      startY = margin;
    }
    autoTable(doc, {
      startY: startY,
      head: [["Charge Description", "Amount"]],
      body: selectedInvoice.charges.map((charge) => [
        charge.description.toUpperCase(),
        `IDR ${formatCurrency(charge.amount)}`,
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        halign: "center",
        cellPadding: 2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fontSize: 9,
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
      },
      margin: { top: 7 },
    });
    startY = doc.lastAutoTable.finalY + 7;
  } else {
    startY = addText("No charges available.", margin, startY);
  }

  // Total Amount
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    const totalAmount = selectedInvoice.charges.reduce(
      (sum, charge) => sum + Number(charge.amount),
      0
    );
    startY = addText(
      `Total Amount: IDR ${formatCurrency(totalAmount)}`,
      margin,
      startY,
      10,
      "bold"
    );
  }

  // Footer
  startY += 3;

  // Generate QR Code
  try {
    const qrCodeData = selectedInvoice.qr_code; // Ambil URL dari kolom qr_code
    const QRCode = await import("qrcode");
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 100,
      margin: 1,
    });

    // Periksa ruang sebelum menambahkan footer
    const estimatedFooterHeight = 40; // Perkiraan tinggi footer (teks + QR Code)
    if (startY + estimatedFooterHeight > maxY) {
      doc.addPage();
      startY = margin;
    }

    // Tambahkan teks footer
    const footerTextY = startY; // Simpan posisi Y awal untuk teks footer
    startY = addText(
      "PAYMENT SHOULD BE RECEIVED IN FULL AMOUNT",
      margin,
      startY,
      10,
      "bold"
    );
    startY = addText("CV. MANDIRI BERSAMA", margin, startY, 10);
    startY = addText("IDR REK No: 1400012299286", margin, startY, 10);
    startY = addText("BANK MANDIRI Cab. Surabaya Niaga.", margin, startY, 10);

    // Tambahkan QR Code sejajar dengan teks footer
    const qrCodeHeight = 30; // Tinggi QR Code
    const qrCodeWidth = 30; // Lebar QR Code
    const qrCodeX = doc.internal.pageSize.width - margin - qrCodeWidth; // Posisi X QR Code (kanan)
    const qrCodeY = footerTextY; // Posisi Y QR Code (sejajar dengan teks footer)

    // Pastikan QR Code tidak melebihi batas halaman
    if (qrCodeY + qrCodeHeight > maxY) {
      doc.addPage();
      startY = margin;
    }

    // Tambahkan QR Code
    doc.addImage(
      qrCodeImage,
      "PNG",
      qrCodeX,
      qrCodeY,
      qrCodeWidth,
      qrCodeHeight
    );

    // Tambahkan teks di bawah QR Code
    const qrInfoX = qrCodeX - 39; // Posisi X untuk teks di bawah QR Code
    const qrInfoY = qrCodeY + qrCodeHeight + 5; // Posisi Y untuk teks di bawah QR Code
    addText(
      "*Scan the QR code to validate invoice authenticity",
      qrInfoX,
      qrInfoY,
      8,
      "bold"
    );
  } catch (error) {
    console.error("Error generating QR code:", error);
    alert("Gagal membuat QR Code.");
  }

  // Simpan PDF
  doc.save(`INVOICE_${selectedInvoice.invoice_number}.pdf`);
};
