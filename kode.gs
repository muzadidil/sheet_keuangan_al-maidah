function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('PEMBUKUAN - TPQ AL-MAIDAH KARANGSONO')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function simpanData(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Format harga ke Rupiah di Google Sheets
    var noRekFormatted = 'Rp '    + data.noRek.toLocaleString('id-ID');
    
    sheet.appendRow([
      new Date(),
      data.nama,
      noRekFormatted,
      data.qty,
      data.harga,
      data.jenis,
      'Berhasil'
    ]);
    
    return { status: 'success', message: 'Data berhasil disimpan' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}
    
