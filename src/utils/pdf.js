import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export function exportPDF(entries, currentUser, selMonth, sigDataURL, logoDataURL, lang, t) {
  const [yr, mn] = selMonth.split('-').map(Number);
  const monthName = t('MONTHS')[mn - 1];

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210, PH = 297, ML = 20, MR = 20;
  const CW = PW - ML - MR;

  const BLACK  = [10, 10, 10];
  const GOLD   = [200, 169, 110];
  const MID    = [130, 130, 130];
  const LIGHT  = [240, 239, 235];
  const WHITE  = [255, 255, 255];

  // --- HEADER ---
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PW, 32, 'F');

  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, 'PNG', ML, 5, 20, 20);
    } catch (e) { console.warn('PDF logo error:', e); }
  }

  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GLFM', ML + 26, 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GOLD);
  doc.text(t('appSubtitle').toUpperCase(), ML + 26, 20);

  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${monthName} ${yr}`, PW - MR, 13, { align: 'right' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GOLD);
  doc.text(t('pdfMonthlyReport'), PW - MR, 20, { align: 'right' });

  // --- EMPLOYEE INFO ---
  let Y = 42;
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, Y, CW, 24, 2, 2, 'S');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text(t('pdfEmpName'), ML + 8, Y + 7);
  doc.text(t('pdfPeriod'), ML + 8, Y + 17);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(currentUser.fullname, ML + 8, Y + 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${monthName} ${yr}`, ML + 8, Y + 22);

  const colMid = ML + CW / 2 + 8;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text(t('pdfEmpId'), colMid, Y + 7);
  doc.text(t('pdfGenerated'), colMid, Y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(currentUser.id, colMid, Y + 12);
  const genDate = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(genDate, colMid, Y + 22);

  // --- TABLE ---
  Y += 30;

  const tableHead = [[
    t('pdfTableNum'), t('pdfTableDate'), t('pdfTablePlace'),
    t('pdfTableTime'), t('pdfTableHours'), t('pdfTableNotes')
  ]];

  const tableBody = entries.map((e, i) => {
    const d = new Date(e.date + 'T12:00:00');
    const dateStr = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return [
      String(i + 1),
      dateStr,
      e.place,
      e.from && e.to ? `${e.from} – ${e.to}` : (e.from || e.to || '—'),
      `${fmtHrs(e.hours)} h`,
      e.notes || '—'
    ];
  });

  autoTable(doc, {
    startY: Y,
    head: tableHead,
    body: tableBody,
    margin: { left: ML, right: MR },
    tableWidth: CW,
    styles: {
      font: 'helvetica', fontSize: 8.5,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 4 },
      textColor: BLACK, lineColor: LIGHT, lineWidth: 0.3
    },
    headStyles: {
      fillColor: BLACK, textColor: GOLD, fontStyle: 'bold', fontSize: 7.5,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 4 }
    },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center', textColor: MID },
      1: { cellWidth: 28 },
      2: { cellWidth: 44 },
      3: { cellWidth: 32 },
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: GOLD },
      5: { cellWidth: 'auto', textColor: MID, fontSize: 7.5 }
    },
    didParseCell(data) {
      if (data.section === 'head') {
        data.cell.styles.halign = (data.column.index === 0 || data.column.index === 4) ? 'center' : 'left';
      }
    }
  });

  // --- TOTAL BAR ---
  let FY = doc.lastAutoTable.finalY + 10;
  const totalHrs = entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);
  const barH = 22;

  doc.setFillColor(...BLACK);
  doc.roundedRect(ML, FY, CW, barH, 2, 2, 'F');

  doc.setTextColor(...GOLD);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdfTotalLabel'), ML + 10, FY + 8);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(fmtHrs(totalHrs), ML + 10, FY + 19);

  doc.setTextColor(...MID);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${entries.length} ${t('pdfDaysLogged')}`, ML + 40, FY + 19);

  doc.setTextColor(...WHITE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${monthName} ${yr}  ·  ${currentUser.fullname}`, PW - MR, FY + 14, { align: 'right' });

  // --- SIGNATURE & OFFICE ---
  FY += barH + 16;
  if (FY + 50 > PH - 16) { doc.addPage(); FY = 20; }

  const sigBoxW = 86;
  const sigBoxH = 42;
  const offBoxW = 56;
  const offBoxH = 42;

  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, FY, sigBoxW, sigBoxH, 2, 2, 'S');

  if (sigDataURL) {
    try {
      doc.addImage(sigDataURL, 'PNG', ML + 3, FY + 2, sigBoxW - 6, sigBoxH - 16);
    } catch (imgErr) { console.warn('PDF addImage error:', imgErr); }
  }

  doc.setDrawColor(...LIGHT);
  doc.line(ML + 5, FY + sigBoxH - 11, ML + sigBoxW - 5, FY + sigBoxH - 11);
  doc.setTextColor(...MID);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(t('pdfSigLabel'), ML + 5, FY + sigBoxH - 7);
  doc.text(currentUser.fullname, ML + 5, FY + sigBoxH - 1);

  doc.setFontSize(6);
  doc.setTextColor(...MID);
  const today = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`${t('pdfSigDate')}: ${today}`, ML, FY + sigBoxH + 5);

  const offX = PW - MR - offBoxW;
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.3);
  doc.roundedRect(offX, FY, offBoxW, offBoxH, 2, 2, 'S');
  doc.setTextColor(...MID);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdfOfficeLabel'), offX + offBoxW / 2, FY + 9, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(t('pdfOfficeStamp'), offX + offBoxW / 2, FY + sigBoxH - 6, { align: 'center' });

  // --- FOOTER ---
  const footY = PH - 10;
  doc.setFillColor(...BLACK);
  doc.rect(0, footY - 5, PW, 16, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text('GLFM', ML, footY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text(t('pdfFooterText'), PW / 2, footY + 2, { align: 'center' });
  doc.text(new Date().toISOString().split('T')[0], PW - MR, footY + 2, { align: 'right' });

  const fn = `GLFM_${currentUser.fullname.replace(/\s+/g, '_')}_${monthName}_${yr}.pdf`;
  doc.save(fn);
}

function fmtHrs(h) {
  const n = parseFloat(h) || 0;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}
