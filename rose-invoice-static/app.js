
  // Go to Ball Park Estimate button
  const btnGotoEstimate = document.getElementById('btn-goto-estimate');
  if (btnGotoEstimate) {
    btnGotoEstimate.addEventListener('click', function() {
      const section = document.getElementById('ballpark-estimate-section');
      if (section) section.scrollIntoView({behavior:'smooth'});
    });
  }


(function(){
  // Utility and DOM variables (declare only once)
  const $ = (sel)=>document.querySelector(sel);
  const itemsBody = $('#items-body');
  const taxRate = $('#tax-rate');
  const discountRate = $('#discount-rate');
  const subtotalEl = $('#subtotal');
  const totalEl = $('#total');
  const btnAdd = $('#btn-add');
  const btnPDF = $('#btn-generate');
  const btnSaveJson = $('#btn-save-json');
  const fileJson = $('#file-json');
  const disclaimerTextarea = $('#warranty-disclaimer');
  const btnSaveDisclaimer = $('#btn-save-disclaimer');
  const notesTextarea = $('#notes');
  const btnSaveNotes = $('#btn-save-notes');
  const currency = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
  $('#year').textContent = new Date().getFullYear();



  // --- Ball Park Estimate Section ---
  const estimateBody = document.getElementById('estimate-body');
  const btnAddEstimate = document.getElementById('btn-add-estimate');
  const estimateSubtotalEl = document.getElementById('estimate-subtotal');
  const estimateTotalEl = document.getElementById('estimate-total');

  function addEstimateRow(data={description:'', qty:1, price:0}){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="w" type="text" value="${data.description}"/></td>
      <td><input class="qty" type="number" min="0" value="${data.qty}"/></td>
      <td><input class="price" type="number" min="0" step="0.01" value="${data.price}"/></td>
      <td class="line-total">$0.00</td>
      <td><button class="btn" title="Remove">✕</button></td>
    `;
    estimateBody.appendChild(tr);
    tr.querySelectorAll('input').forEach(i=> i.addEventListener('input', computeEstimateTotals));
    tr.querySelector('button').addEventListener('click', ()=>{ tr.remove(); computeEstimateTotals(); });
    computeEstimateTotals();
  }

  function getEstimateRows(){
    const rows = [];
    estimateBody.querySelectorAll('tr').forEach(tr=>{
      const d = tr.querySelector('.w').value.trim();
      const q = Number(tr.querySelector('.qty').value || 0);
      const p = Number(tr.querySelector('.price').value || 0);
      rows.push({description:d, qty:q, price:p});
    });
    return rows;
  }

  function computeEstimateTotals(){
    let sub = 0;
    estimateBody.querySelectorAll('tr').forEach(tr=>{
      const q = Number(tr.querySelector('.qty').value || 0);
      const p = Number(tr.querySelector('.price').value || 0);
      const t = q * p;
      tr.querySelector('.line-total').textContent = currency.format(t);
      sub += t;
    });
    estimateSubtotalEl.textContent = currency.format(sub);
    estimateTotalEl.textContent = currency.format(sub);
    return {sub};
  }

  if(btnAddEstimate) btnAddEstimate.addEventListener('click', ()=> addEstimateRow({description:'', qty:1, price:0}));
  // Inicializa con una fila vacía
  if(estimateBody && estimateBody.children.length === 0) addEstimateRow();

  // Ball Park Estimate PDF export (must be after getEstimateRows is defined)
  const btnEstimatePDF = document.getElementById('btn-estimate-pdf');
  if (btnEstimatePDF) {
    btnEstimatePDF.addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({unit:'pt', format:'a4'});
      const left = 40, right = 555;
      let y = 48;
      const logoImg = new window.Image();
      logoImg.src = 'static/logo.png';
      logoImg.onload = function() {
        // Logo y empresa
        doc.addImage(logoImg, 'PNG', left, y-10, 40, 40);
        const textLeft = left + 34 + 16;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Rose Legacy Home Solutions LLC', textLeft, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('HVAC Services | Overland Park, KS', textLeft, y+14);
        doc.text('Phone: 816 298 4828 | Email: appointments@roselegacyhvac.com', textLeft, y+28);
        let y2 = y + 56;

        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('BALL PARK ESTIMATE', left, y2);
        doc.setFont('helvetica', '');
        y2 += 18;

        // Estimate table
        const estimateRows = getEstimateRows();
        const body = estimateRows.map(it=>[
          it.description, String(it.qty||0), currency.format(Number(it.price||0)), currency.format((it.qty||0)*(Number(it.price||0)))
        ]);
        doc.autoTable({
          startY: y2+12,
          head: [['Description','Qty','Unit Price','Total']],
          body,
          styles: { fontSize: 10 },
          headStyles: { fillColor:[128,128,128] },
          columnStyles: {
            0:{ cellWidth: 280 }, 1:{ halign:'right' }, 2:{ halign:'right' }, 3:{ halign:'right' }
          },
          theme: 'grid',
          margin: { left, right: 40 }
        });
        let endY = doc.autoTable.previous.finalY + 20;
        // Totals
        const subtotal = estimateRows.reduce((sum, it) => sum + (Number(it.qty||0)*Number(it.price||0)), 0);
        doc.setFontSize(13);
        doc.setFont('helvetica','bold');
        doc.text('Subtotal:', right-180, endY);
        doc.text(currency.format(subtotal), right, endY, {align:'right'});
        endY += 18;
        doc.setFont('helvetica','bold');
        doc.text('Estimated Total:', right-180, endY);
        doc.text(currency.format(subtotal), right, endY, {align:'right'});

        const fileName = `estimate-${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
      };
      logoImg.onerror = function() {
        alert('Logo image could not be loaded for PDF.');
      };
    });
  }


  function addRow(data={description:'', qty:1, price:0}){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="w" type="text" value="${data.description}"/></td>
      <td><input class="qty" type="number" min="0" value="${data.qty}"/></td>
      <td><input class="price" type="number" min="0" step="0.01" value="${data.price}"/></td>
      <td class="line-total">$0.00</td>
      <td><button class="btn" title="Remove">✕</button></td>
    `;
    itemsBody.appendChild(tr);
    tr.querySelectorAll('input').forEach(i=> i.addEventListener('input', computeTotals));
    tr.querySelector('button').addEventListener('click', ()=>{ tr.remove(); computeTotals(); });
    computeTotals();
  }

  function getRows(){
    const rows = [];
    itemsBody.querySelectorAll('tr').forEach(tr=>{
      const d = tr.querySelector('.w').value.trim();
      const q = Number(tr.querySelector('.qty').value || 0);
      const p = Number(tr.querySelector('.price').value || 0);
      rows.push({description:d, qty:q, price:p});
    });
    return rows;
  }

  function computeTotals(){
    let sub = 0;
    itemsBody.querySelectorAll('tr').forEach(tr=>{
      const q = Number(tr.querySelector('.qty').value || 0);
      const p = Number(tr.querySelector('.price').value || 0);
      const t = q * p;
      tr.querySelector('.line-total').textContent = currency.format(t);
      sub += t;
    });
    const tax = sub * (Number(taxRate.value||0)/100);
    const disc = sub * (Number(discountRate.value||0)/100);
    const total = sub + tax - disc;
    subtotalEl.textContent = currency.format(sub);
    totalEl.textContent = currency.format(total);
    return {sub, tax, disc, total};
  }

  // Load disclaimer from localStorage or empty
  function loadDisclaimer() {
    const saved = localStorage.getItem('warrantyDisclaimer');
    const defaultDisclaimer = `This service includes warranty coverage only for the work performed today.\n\nAny future issues unrelated to these components, such as refrigerant leaks, compressor failure, or problems with the evaporator coil, are not covered under this warranty and will be quoted separately as new service requests.`;
    disclaimerTextarea.value = saved !== null ? saved : defaultDisclaimer;
  }
  // Save disclaimer to localStorage
  function saveDisclaimer() {
    localStorage.setItem('warrantyDisclaimer', disclaimerTextarea.value.trim());
  }
  btnSaveDisclaimer.addEventListener('click', () => {
    saveDisclaimer();
    btnSaveDisclaimer.textContent = 'Saved!';
    setTimeout(()=>{ btnSaveDisclaimer.textContent = 'Save'; }, 1200);
  });
  loadDisclaimer();

  // Notes save/load
  function loadNotes() {
    const saved = localStorage.getItem('invoiceNotes');
    if (saved !== null) notesTextarea.value = saved;
  }
  function saveNotes() {
    localStorage.setItem('invoiceNotes', notesTextarea.value.trim());
  }
  btnSaveNotes.addEventListener('click', () => {
    saveNotes();
    btnSaveNotes.textContent = 'Saved!';
    setTimeout(()=>{ btnSaveNotes.textContent = 'Save'; }, 1200);
  });
  loadNotes();

  function collectData(){
    return {
      company:{
        name:'Rose Legacy Home Solutions LLC',
        address:'Overland Park, KS',
        phone:'816 298 4828',
        email:'appointments@roselegacyhvac.com'
      },
      invoice:{
        number: $('#inv-number').value || '',
        date: $('#inv-date').value || '',
        client: $('#client-name').value || '',
        taxRate: Number(taxRate.value || 0),
        discountRate: Number(discountRate.value || 0),
        paymentMethod: $('#payment-method').value || 'Cash',
        terms: $('#terms').value || '',
        notes: localStorage.getItem('invoiceNotes') || notesTextarea.value || ''
      },
      items: getRows(),
      warrantyDisclaimer: localStorage.getItem('warrantyDisclaimer') || disclaimerTextarea.value.trim()
    };
  }

  function loadData(d){
    $('#inv-number').value = d.invoice?.number || '';
    $('#inv-date').value = d.invoice?.date || '';
    $('#client-name').value = d.invoice?.client || '';
    taxRate.value = d.invoice?.taxRate ?? 0;
    discountRate.value = d.invoice?.discountRate ?? 0;
    $('#payment-method').value = d.invoice?.paymentMethod || 'Cash';
    $('#terms').value = d.invoice?.terms || '';
    notesTextarea.value = d.invoice?.notes || '';
    itemsBody.innerHTML='';
    (d.items || []).forEach(addRow);
    if((d.items||[]).length===0){ addRow({description:'', qty:1, price:0}); }
    computeTotals();
    if (d.warrantyDisclaimer) {
      disclaimerTextarea.value = d.warrantyDisclaimer;
    }
    // Guardar en localStorage para persistencia
    saveNotes();
    saveDisclaimer();
  }

  // Buttons
  btnAdd.addEventListener('click', ()=> addRow({description:'', qty:1, price:0}));
  taxRate.addEventListener('input', computeTotals);
  discountRate.addEventListener('input', computeTotals);

  btnSaveJson.addEventListener('click', ()=>{
    const data = collectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `invoice-${data.invoice.number||stamp}.json`;
    a.click();
  });
  fileJson.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const txt = await file.text();
    const d = JSON.parse(txt);
    loadData(d);
  });

  btnPDF.addEventListener('click', ()=>{

    const data = collectData();
    const calc = computeTotals();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'pt', format:'a4'});
    const left = 40, right = 555;
    let y = 48;

    // Load logo image and generate PDF after image is loaded
    const logoImg = new window.Image();
    logoImg.src = 'static/logo.png';
    logoImg.onload = function() {
  // Draw logo image (34x34pt)
  doc.addImage(logoImg, 'PNG', left, y-10, 40 , 40);
  const textLeft = left + 34 + 16; // logo width + extra space
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Rose Legacy Home Solutions LLC', textLeft, y);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('HVAC Services | Overland Park, KS', textLeft, y+14);
  doc.text('Phone: 816 298 4828 | Email: appointments@roselegacyhvac.com', textLeft, y+28);
  let y2 = y + 56;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('INVOICE', left, y2);
  doc.setFont('helvetica', '');
  y2 += 18;

      // Info row
      const dateStr = (data.invoice.date || new Date().toISOString().slice(0,10));
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #:`, left, y2);
  doc.setFont('helvetica', '');
  doc.text(`${data.invoice.number || '—'}`, left+70, y2);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date:`, right-150, y2, {align:'left'});
  doc.setFont('helvetica', '');
  doc.text(`${dateStr}`, right-110, y2, {align:'left'});
  y2 += 18;
  doc.setFont('helvetica', 'normal');
  doc.text(`Client:`, left, y2);
  doc.setFont('helvetica', '');
  doc.text(`${data.invoice.client || '—'}`, left+50, y2);
  y2 += 10;

      // Items table
      const body = data.items.map(it=>[
        it.description, String(it.qty||0), currency.format(Number(it.price||0)), currency.format((it.qty||0)*(Number(it.price||0)))
      ]);
      doc.autoTable({
        startY: y2+12,
        head: [['Description','Qty','Unit Price','Total']],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor:[128,128,128] },
        columnStyles: {
          0:{ cellWidth: 280 }, 1:{ halign:'right' }, 2:{ halign:'right' }, 3:{ halign:'right' }
        },
        theme: 'grid',
        margin: { left, right: 40 }
      });

      let endY = doc.autoTable.previous.finalY + 30;
      // Totals block on right
      const totals = [
        ['Subtotal:', currency.format(calc.sub)],
        [`Tax (${(data.invoice.taxRate||0)}%):`, currency.format(calc.tax)],
        [`Discount (${(data.invoice.discountRate||0)}%):`, '-'+currency.format(calc.disc)],
        ['Total Amount Due:', currency.format(calc.total)]
      ];
      totals.forEach((row,i)=>{
        if(row[0].includes('Total Amount Due')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(91,45,144);
          doc.text(row[0], right-180, endY + i*16);
          doc.text(row[1], right,    endY + i*16, { align:'right' });
          doc.setTextColor(0,0,0);
          doc.setFontSize(10);
          doc.setFont('helvetica', '');
        } else {
          doc.setFont('helvetica', 'bold');
          doc.text(row[0], right-180, endY + i*16);
          doc.setFont('helvetica', '');
          doc.text(row[1], right,    endY + i*16, { align:'right' });
        }
      });
      endY += totals.length*16 + 18;

      // Payment & Terms
      doc.setFontSize(12);
      doc.text(`Payment Method: ${data.invoice.paymentMethod}`, left, endY);
      
      endY += 14;
      if (data.invoice.terms){
        doc.text(`Terms: ${data.invoice.terms}`, left, endY);
        endY += 14;
      }

      // Warranty
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Important Warranty Disclaimer:', left, endY+8);
  doc.setFont('helvetica', '');
  endY += 24;
      const wrap = (txt, maxWidth)=>{
        const lines = [];
        txt.split('\n').forEach(paragraph => {
          const words = paragraph.split(' ');
          let line = '';
          words.forEach(w => {
            const test = line ? line + ' ' + w : w;
            if (doc.getTextWidth(test) > maxWidth) { lines.push(line); line = w; }
            else line = test;
          });
          if (line) lines.push(line);
        });
        return lines;
      };
      wrap(data.warrantyDisclaimer, 520).forEach(l=>{ doc.text(l, left, endY); endY+=14; });

      // Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Notes:', left, endY+8);
  doc.setFont('helvetica', '');
  endY += 24;
      wrap(data.invoice.notes, 520).forEach(l=>{ doc.text(l, left, endY); endY+=14; });

      const fileName = `invoice-${(data.invoice.number || dateStr)}.pdf`;
      doc.save(fileName);
    };
    logoImg.onerror = function() {
      alert('Logo image could not be loaded for PDF.');
    };

  });

  // No seed data: los campos estarán vacíos al abrir la página
})();
