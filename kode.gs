function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('PEMBUKUAN - TPQ AL-MAIDAH KARANGSONO')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function simpanData(data) {
  try {
    // Agar lebih aman dan konsisten, kita pastikan dia selalu menyimpan ke sheet "BASE"
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE");
    
    // Ubah data input harga menjadi angka murni agar bisa dijumlahkan di Sheet
    var hargaAngka = Number(data.noRek); 
    
    sheet.appendRow([
      new Date(),      // [0] Kolom A: Timestamp
      data.nama,       // [1] Kolom B: Keterangan Pengeluaran
      hargaAngka,      // [2] Kolom C: Total Harga (Tersimpan sbg angka)
      data.qty,        // [3] Kolom D: Qty
      data.harga,      // [4] Kolom E: Satuan
      data.jenis,      // [5] Kolom F: Kategori
      'Berhasil'       // [6] Kolom G: Status
    ]);
    
    return { status: 'success', message: 'Data berhasil disimpan' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
} // <--- KURUNG TUTUP simpanData HARUS DI SINI

// Fungsi harus berdiri sendiri di luar simpanData
function getRiwayatData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE");
    const data = sheet.getDataRange().getValues();
    
    // Jika data hanya 1 baris (cuma header) atau kosong
    if (data.length <= 1) return { status: 'success', data: [] }; 
    
    const riwayat = data.slice(1).reverse().map(row => {
      return {
        waktu: row[0] ? Utilities.formatDate(new Date(row[0]), "GMT+7", "dd/MM/yyyy HH:mm") : "-",
        keterangan: row[1] || "-",
        total: Number(row[2]) || 0, // Ditarik sebagai angka, diformat Rupiah oleh HTML nanti
        qty: row[3] || 0,
        satuan: row[4] || "-",
        kategori: row[5] || "-"
      };
    });
    
    // Ambil 20 data terbaru saja agar tidak berat
    return { status: 'success', data: riwayat.slice(0, 20) };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

// Fungsi untuk merekap data Laporan
function getLaporanData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE");
    const data = sheet.getDataRange().getValues();
    
    // Jika belum ada data transaksi
    if (data.length <= 1) {
      return { status: 'success', data: { total: 0, count: 0, kategori: {} } };
    }
    
    let totalPengeluaran = 0;
    let totalTransaksi = 0;
    let kategoriMap = {};
    
    // Looping data mulai dari baris ke-2 (index 1) untuk melewati header
    for (let i = 1; i < data.length; i++) {
      let row = data[i];
      let harga = Number(row[2]) || 0; // Kolom C (Harga)
      let jenis = row[5] || "Lainnya"; // Kolom F (Kategori)
      
      totalPengeluaran += harga;
      totalTransaksi++;
      
      // Mengelompokkan total harga berdasarkan kategori
      if (kategoriMap[jenis]) {
        kategoriMap[jenis] += harga;
      } else {
        kategoriMap[jenis] = harga;
      }
    }
    
    return { 
      status: 'success', 
      data: { 
        total: totalPengeluaran, 
        count: totalTransaksi, 
        kategori: kategoriMap 
      } 
    };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}
