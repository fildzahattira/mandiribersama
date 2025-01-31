import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from 'qrcode';

// Fungsi utilitas untuk memformat tanggal menjadi "tanggal-bulan-tahun"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0'); // Tambahkan leading zero jika perlu
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
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
    orientation: 'portrait', // Orientasi portrait (default)
    unit: 'mm', // Satuan milimeter
    format: 'a4', // Ukuran kertas A4
  });

  const margin = 20; // Margin kiri dan kanan
  let startY = 10; // Posisi awal untuk menulis data

  // Tambahkan logo di sebelah kiri
  const logoUrl = '/logo.jpeg'; // Replace with the path or URL of the logo
  const marginLogo = 15; // Left margin of the document
  const newWidth = 75; // Desired width for the image in the PDF

  // Original dimensions of the image (replace with the actual dimensions of your image)
  const originalWidth = 300; // Original width of the image in pixels
  const originalHeight = 100; // Original height of the image in pixels

  // Calculate the aspect ratio of the original image
  const aspectRatio = originalWidth / originalHeight;

  // Calculate the new height based on the aspect ratio
  const newHeight = newWidth / aspectRatio;

  // Add the image to the PDF with the correct dimensions
  doc.addImage(logoUrl, 'jpeg', marginLogo, 20, newWidth, newHeight);

  // Fungsi untuk menambahkan teks dengan pengecekan batas halaman
  const addText = (text, x, y, fontSize = 10, fontStyle = 'normal', lineHeight = 7) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.text(text, x, y);
    return y + lineHeight; // Kembalikan posisi Y baru dengan jarak antar baris yang lebih rapat
  };

  // Header (Alamat dan Kontak di pojok kanan garis)
  const addressX = doc.internal.pageSize.width - margin - 40; // Posisi X untuk alamat dan kontak (pojok kanan)
  let headerY = 20; // Posisi Y untuk header, sejajar dengan logo
  headerY = addText("JL. Sanggar No 31-33", addressX, headerY, 10);
  headerY = addText("Surabaya (60175)", addressX, headerY, 10);
  headerY = addText("Telp. : +6231-73690229", addressX, headerY, 10);
  headerY = addText("Fax. : +6231-3576864", addressX, headerY, 10);
  headerY = addText("INDONESIA", addressX, headerY, 10);

  // Tambahkan garis horizontal di bawah header
  doc.setLineWidth(0.5); // Ketebalan garis
  doc.line(margin, headerY + 5, doc.internal.pageSize.width - margin, headerY + 5); // (x1, y1, x2, y2)

  // Judul Invoice (Ditempatkan di tengah)
  const invoiceTitle = "Invoice";
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const textWidth = doc.getTextWidth(invoiceTitle); // Hitung lebar teks
  const centerX = (doc.internal.pageSize.width - textWidth) / 2; // Hitung posisi tengah
  startY = headerY + 15; // Tambahkan jarak sebelum tulisan "Invoice" (dari 10 menjadi 15)
  doc.text(invoiceTitle, centerX, startY); // Tambahkan teks di tengah

  // Bill To dan Invoice Details
  const billToX = margin; // Posisi X untuk Bill To
  const invoiceDetailsX = 110; // Posisi X untuk Invoice Details

  startY = addText("Bill To:", billToX, startY + 10, 10, 'bold'); // Jarak tambahan sebelum Bill To
  startY = addText(selectedInvoice.client_name.toUpperCase(), billToX, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText(selectedInvoice.client_address.toUpperCase(), billToX, startY, 10); // Teks dinamis diubah menjadi huruf kapital

  // Format tanggal menggunakan fungsi utilitas
  const formattedDate = formatDate(selectedInvoice.invoice_date);

  startY = addText("Invoice Number: " + selectedInvoice.invoice_number.toUpperCase(), invoiceDetailsX, startY - 14, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Date: " + formattedDate, invoiceDetailsX, startY, 10); // Tanggal tetap seperti semula
  startY = addText("Terms: CASH ONLY", invoiceDetailsX, startY, 10);
  startY += 7; // Beri jarak tambahan

  // Forwarding Vessel hingga ETA
  startY = addText("Forwarding Vessel: " + selectedInvoice.forwarding_vessel.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Port Of Discharge: " + selectedInvoice.port_of_discharge.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Port Of Loading: " + selectedInvoice.port_of_loading.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Bill Lading: " + selectedInvoice.bill_lading.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Shipper: " + selectedInvoice.shipper.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Consignee: " + selectedInvoice.consignee.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Measurement: " + selectedInvoice.measurement.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital
  startY = addText("Cargo Description: " + selectedInvoice.cargo_description.toUpperCase(), margin, startY, 10); // Teks dinamis diubah menjadi huruf kapital

  // Format ETD dan ETA menggunakan fungsi utilitas
  const formattedETD = formatDate(selectedInvoice.etd);
  const formattedETA = formatDate(selectedInvoice.eta);
  startY = addText(`ETD/ETA: ${formattedETD} / ${formattedETA}`, margin, startY, 10); // Tanggal tetap seperti semula
  startY += 7; // Beri jarak tambahan

  // Tabel Charges
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    autoTable(doc, {
      startY: startY,
      head: [["Charge Description", "Amount"]], // Header tabel tetap seperti semula
      body: selectedInvoice.charges.map((charge) => [
        charge.description.toUpperCase(), // Deskripsi diubah menjadi huruf kapital
        `IDR ${formatCurrency(charge.amount)}`,
      ]),
      theme: "grid",
      styles: { 
        fontSize: 9, // Ukuran font lebih kecil
        halign: "center",
        cellPadding: 2, // Padding cell lebih kecil
      },
      headStyles: {
        fontSize: 9, // Ukuran font lebih kecil
        fillColor: [200, 200, 200] // Warna abu-abu untuk header tabel
      },
      margin: { top: 7 } // Margin atas tabel lebih kecil
    });
    startY = doc.lastAutoTable.finalY + 7; // Update startY jika tabel dibuat
  } else {
    startY = addText("No charges available.", margin, startY);
  }

  // Total Amount
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    const totalAmount = selectedInvoice.charges.reduce(
      (sum, charge) => sum + Number(charge.amount),
      0
    );
    startY = addText(`Total Amount: IDR ${formatCurrency(totalAmount)}`, margin, startY, 10, 'bold');
  }

  // // Footer
  startY += 7; // Beri jarak tambahan
  // startY = addText("PAYMENT SHOULD BE RECEIVED IN FULL AMOUNT", margin, startY, 10, 'bold');
  // startY = addText("CV. MANDIRI BERSAMA", margin, startY, 10);
  // startY = addText("IDR REK No: 1400012299286", margin, startY, 10);
  // startY = addText("BANK MANDIRI Cab. Surabaya Niaga.", margin, startY, 10);
  // startY += 7; // Beri jarak tambahan



// Generate QR Code
try {
  const qrCodeData = selectedInvoice.qr_code; // Ambil URL dari kolom qr_code
  const QRCode = await import('qrcode');
  const qrCodeImage = await QRCode.toDataURL(qrCodeData, { width: 100, margin: 1 });
  // Hitung tinggi blok footer (perkiraan)
  const qrCodeHeight = 30; // Tinggi QR Code
  const footerTextHeight = 4 * 7; // 4 baris teks, masing-masing sekitar 7mm tinggi
  const footerBlockHeight = footerTextHeight + qrCodeHeight + 7; // Total tinggi footer (termasuk jarak)

  // Periksa apakah footer akan melebihi batas halaman
  const pageHeight = doc.internal.pageSize.height;
  if (startY + footerBlockHeight + margin > pageHeight) {
    doc.addPage(); // Tambah halaman baru jika tidak cukup ruang
    startY = margin; // Reset posisi Y di halaman baru
  }

  // Tambahkan teks footer terlebih dahulu
  startY = addText("PAYMENT SHOULD BE RECEIVED IN FULL AMOUNT", margin, startY, 10, 'bold');
  startY = addText("CV. MANDIRI BERSAMA", margin, startY + 7, 10);
  startY = addText("IDR REK No: 1400012299286", margin, startY, 10);
  startY = addText("BANK MANDIRI Cab. Surabaya Niaga.", margin, startY, 10);

  // Tambahkan QR Code di bawah teks footer
  const qrCodeWidth = 30;
  const qrCodeX = doc.internal.pageSize.width - margin - qrCodeWidth; // QR Code di kanan
  const qrCodeY = startY + 7; // QR Code di bawah teks terakhir
  doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);


} catch (error) {
  console.error("Error generating QR code:", error);
  alert("Gagal membuat QR Code.");
}

// Simpan PDF
doc.save(`INVOICE_${selectedInvoice.invoice_number}.pdf`);
};