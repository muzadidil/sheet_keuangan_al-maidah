// ==========================================
// FILE KHUSUS UNTUK FITUR SUSUNAN PANITIA
// ==========================================

// 1. Fungsi mengambil data Nama (Kolom C) & Jabatan (Kolom D) dari Sheet KATEGORI
function getDataPanitia() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("KATEGORI");
    if (!sheet) return { status: 'error', nama: [], jabatan: [] };
    
    const data = sheet.getDataRange().getValues();
    let namaSet = new Set();
    let jabatanSet = new Set();
    
    for (let i = 0; i < data.length; i++) {
      let nama = data[i][2] ? String(data[i][2]).trim() : "";       // Kolom C
      let jabatan = data[i][3] ? String(data[i][3]).trim() : "";    // Kolom D
      
      if (nama && nama.toLowerCase() !== "nama panitia" && nama.toLowerCase() !== "nama") {
        namaSet.add(nama);
      }
      if (jabatan && jabatan.toLowerCase() !== "jabatan" && jabatan.toLowerCase() !== "peran") {
        jabatanSet.add(jabatan);
      }
    }
    return { status: 'success', nama: Array.from(namaSet), jabatan: Array.from(jabatanSet) };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

// 2. Fungsi menyimpan data ke Sheet SUSUNAN_PANITIA
function simpanSusunan(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SUSUNAN_PANITIA");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("SUSUNAN_PANITIA");
      sheet.appendRow(["WAKTU INPUT", "JABATAN", "NAMA PANITIA"]);
    }
    sheet.appendRow([ new Date(), data.jabatan, data.nama ]);
    return { status: 'success', message: 'Susunan panitia berhasil disimpan' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

// 3. FUNGSI BARU: Menarik Data dari Sheet SUSUNAN_PANITIA dengan Filter
function getSusunanPanitia(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SUSUNAN_PANITIA");
    if (!sheet) return { status: 'success', data: [] }; 

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'success', data: [] }; 

    let searchQuery = (params && params.search) ? params.search.toLowerCase() : "";
    let filterJabatan = (params && params.jabatan) ? params.jabatan : "";

    // Membaca Kolom B (Jabatan) dan Kolom C (Nama)
    let listPanitia = data.slice(1).map(row => {
      return {
        jabatan: row[1] || "-",
        nama: row[2] || "-"
      };
    }).reverse(); // Urutkan dari yang terbaru diinput

    // Jalankan Filter Pencarian Nama
    if (searchQuery) {
      listPanitia = listPanitia.filter(item => String(item.nama).toLowerCase().includes(searchQuery));
    }

    // Jalankan Filter Jabatan
    if (filterJabatan) {
      listPanitia = listPanitia.filter(item => item.jabatan === filterJabatan);
    }

    return { status: 'success', data: listPanitia };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}