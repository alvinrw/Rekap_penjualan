import express from 'express';
import nodemailer from 'nodemailer';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/jadwal-export
router.get('/', async (req, res) => {
  try {
    const list = await prisma.jadwalExport.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    console.error('Fetch jadwal error:', err);
    res.status(500).json({ error: 'Gagal mengambil data jadwal export.' });
  }
});

// POST /api/jadwal-export/send-email
router.post('/send-email', async (req, res) => {
  try {
    const { toEmail, recipientName, reportType, reportLabel, fileBase64, fileName } = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: 'Email tujuan wajib diisi.' });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log(`[SIMULATED EMAIL DISPATCH] To: ${toEmail} | Subject: Laporan ${reportLabel} | File: ${fileName}`);
      return res.json({
        success: true,
        isSimulated: true,
        message: `[Simulasi Pengiriman Email] Laporan '${reportLabel}' berhasil diproses untuk ${recipientName} (${toEmail}).`,
        details: {
          toEmail,
          recipientName,
          reportLabel,
          fileName,
          sentAt: new Date().toISOString(),
          note: 'Untuk mengaktifkan pengiriman email sungguhan ke inbox via Gmail/SMTP, masukkan SMTP_USER & SMTP_PASS pada file .env backend.',
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const attachments = [];
    if (fileBase64 && fileName) {
      const base64Data = fileBase64.replace(/^data:.*;base64,/, '');
      attachments.push({
        filename: fileName,
        content: Buffer.from(base64Data, 'base64'),
      });
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Peternakan Unggul Mandiri'}" <${smtpUser}>`,
      to: toEmail,
      subject: `[LAPORAN AUTOMATED BACKUP] ${reportLabel} - ${new Date().toLocaleDateString('id-ID')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0369a1;">Peternakan Unggul Mandiri</h2>
          <p>Halo <strong>${recipientName}</strong>,</p>
          <p>Terlampir laporan backup otomatis sistem: <strong>${reportLabel}</strong>.</p>
          <p>Silakan unduh berkas lampiran <code>${fileName}</code> yang ada pada email ini.</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">Pesan otomatis dari Sistem Pendataan Ayam Broiler Berbasis Kloter.</p>
        </div>
      `,
      attachments,
    });

    res.json({
      success: true,
      isSimulated: false,
      messageId: info.messageId,
      message: `Laporan '${reportLabel}' berhasil dikirimkan ke ${toEmail} via Server SMTP!`,
      details: {
        toEmail,
        recipientName,
        reportLabel,
        fileName,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: `Gagal mengirim email: ${err.message}` });
  }
});

// POST /api/jadwal-export
router.post('/', async (req, res) => {
  try {
    const { targetEmail, targetUserId, targetUserNama, periode, hari, jam, jenisLaporan } = req.body;
    const id = `SCH-${Date.now().toString().slice(-4)}`;

    const newSchedule = await prisma.jadwalExport.create({
      data: {
        id,
        targetEmail: targetEmail || null,
        targetUserId: targetUserId || null,
        targetUserNama: targetUserNama || null,
        periode: periode || 'mingguan',
        hari: hari || 'Senin',
        jam: jam || '08:00',
        jenisLaporan: jenisLaporan || 'penjualan',
        statusAktif: true,
      },
    });

    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Create jadwal error:', err);
    res.status(500).json({ error: 'Gagal membuat jadwal export baru.' });
  }
});

// PUT /api/jadwal-export/:id/toggle
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { statusAktif } = req.body;

    const updated = await prisma.jadwalExport.update({
      where: { id },
      data: { statusAktif },
    });

    res.json(updated);
  } catch (err) {
    console.error('Toggle jadwal error:', err);
    res.status(500).json({ error: 'Gagal mengubah status jadwal export.' });
  }
});

// DELETE /api/jadwal-export/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jadwalExport.delete({ where: { id } });
    res.json({ message: 'Jadwal export berhasil dihapus.' });
  } catch (err) {
    console.error('Delete jadwal error:', err);
    res.status(500).json({ error: 'Gagal menghapus jadwal export.' });
  }
});

export default router;
