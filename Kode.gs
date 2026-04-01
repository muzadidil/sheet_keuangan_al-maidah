function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('PEMBUKUAN - TPQ AL-MAIDAH KARANGSONO')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// 1. FUNGSI AMBIL DATA DROPDOWN (KATEGORI & SATUAN)
// ==========================================
function getDropdownData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("KATEGORI");
    if (!sheet) return { status: 'success', satuan: [], kategori: [] };
    
    const data = sheet.getDataRange().getValues();
    let satuanSet = new Set();
    let kategoriSet = new Set();
    
    for (let i = 0; i < data.length; i++) {
      let s = data[i][0] ? String(data[i][0]).trim() : "";
      let k = data[i][1] ? String(data[i][1]).trim() : "";
      if (s && s.toLowerCase() !== "satuan" && s.toLowerCase() !== "unit") satuanSet.add(s);
      if (k && k.toLowerCase() !== "kategori") kategoriSet.add(k);
    }
    return { status: 'success', satuan: Array.from(satuanSet), kategori: Array.from(kategoriSet) };
  } catch (e) { return { status: 'error', message: e.toString() }; }
}

// ==========================================
// 2. FUNGSI SIMPAN PENGELUARAN
// ==========================================
function simpanData(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE");
    var hargaAngka = Number(data.noRek); 
    sheet.appendRow([
      new Date(), data.pj, data.nama, hargaAngka, data.qty, data.harga, data.jenis, 'Berhasil'
    ]);
    return { status: 'success', message: 'Data pengeluaran berhasil disimpan' };
  } catch (e) { return { status: 'error', message: e.toString() }; }
}

// ==========================================
// 3. FUNGSI SIMPAN PEMASUKAN
// ==========================================
function simpanPemasukan(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PEMASUKAN");
    var nominalAngka = Number(data.nominal); 
    var waktuSekarang = new Date();
    var formatTanggal = Utilities.formatDate(waktuSekarang, "GMT+7", "dd MMMM yyyy");
    sheet.appendRow([
      waktuSekarang, formatTanggal, data.pj, nominalAngka, data.keterangan
    ]);
    return { status: 'success', message: 'Data pemasukan berhasil disimpan' };
  } catch (e) { return { status: 'error', message: e.toString() }; }
}

// ==========================================
// 4. FUNGSI TARIK DATA RIWAYAT
// ==========================================
function getRiwayatData(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BASE");
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'success', data: [] }; 
    
    let limit = (params && params.limit) ? params.limit : 20;
    let searchQuery = (params && params.search) ? params.search.toLowerCase() : "";
    let filterKategori = (params && params.kategori) ? params.kategori : "";
    
    let riwayat = data.slice(1).reverse().map(row => {
      return {
        waktu: row[0] ? Utilities.formatDate(new Date(row[0]), "GMT+7", "dd/MM/yyyy HH:mm") : "-",
        pj: row[1] || "-",           
        keterangan: row[2] || "-",   
        total: Number(row[3]) || 0,  
        qty: row[4] || 0,            
        satuan: row[5] || "-",       
        kategori: row[6] || "-"      
      };
    });

    if (searchQuery) {
      riwayat = riwayat.filter(item => 
        String(item.keterangan).toLowerCase().includes(searchQuery) ||
        String(item.pj).toLowerCase().includes(searchQuery)
      );
    }

    if (filterKategori) {
      riwayat = riwayat.filter(item => item.kategori === filterKategori);
    }
    
    return { status: 'success', data: riwayat.slice(0, limit) };
  } catch (error) { return { status: 'error', message: error.toString() }; }
}

// ==========================================
// 5. FUNGSI TARIK DATA LAPORAN & PDF
// ==========================================
function getLPJData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const baseSheet = ss.getSheetByName("BASE");
    const baseData = baseSheet ? baseSheet.getDataRange().getValues() : [];
    const pemSheet = ss.getSheetByName("PEMASUKAN");
    const pemData = pemSheet ? pemSheet.getDataRange().getValues() : [];
    const strukSheet = ss.getSheetByName("STRUKTUR");
    
    let struktur = { pj: "", ketua: "", bendahara: "", sekretaris: "" };
    
    // REVISI: pj sekarang membaca sel A2
    if (strukSheet) {
      struktur.pj = strukSheet.getRange("A2").getValue() || "..........................";
      struktur.ketua = strukSheet.getRange("B2").getValue() || "..........................";
      struktur.bendahara = strukSheet.getRange("C2").getValue() || "..........................";
      struktur.sekretaris = strukSheet.getRange("D2").getValue() || "..........................";
    }

    let grouped = {};
    let totalPengeluaran = 0;
    
    for (let i = 1; i < baseData.length; i++) {
      let row = baseData[i];
      let nominal = Number(row[3]) || 0;
      let cat = row[6] || "Lainnya";
      
      let item = {
        tanggal: row[0] ? Utilities.formatDate(new Date(row[0]), "GMT+7", "dd/MM/yyyy") : "-",
        keterangan: row[2] || "-",
        qty: row[4] || 0,
        satuan: row[5] || "-",
        nominal: nominal
      };
      
      if (!grouped[cat]) grouped[cat] = { total: 0, items: [] };
      grouped[cat].total += nominal;
      grouped[cat].items.push(item);
      totalPengeluaran += nominal;
    }

    let totalPemasukan = 0;
    for (let i = 1; i < pemData.length; i++) {
      totalPemasukan += (Number(pemData[i][3]) || 0);
    }

    return { 
      status: 'success', 
      data: { grouped: grouped, totalPemasukan: totalPemasukan, totalPengeluaran: totalPengeluaran, saldo: totalPemasukan - totalPengeluaran, struktur: struktur }
    };
  } catch (error) { return { status: 'error', message: error.toString() }; }
}