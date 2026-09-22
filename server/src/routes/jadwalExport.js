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

    let transporter;
    let isEthereal = false;
    let senderAddress = '';

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      senderAddress = `"${process.env.SMTP_FROM_NAME || 'Peternakan Unggul Mandiri'}" <${smtpUser}>`;
    } else {
      // Create test account on Ethereal for real SMTP dispatch and web inbox view
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      senderAddress = `"Peternakan Unggul Mandiri (Mail Server)" <${testAccount.user}>`;
    }

    const attachments = [];
    if (fileBase64 && fileName) {
      const base64Data = fileBase64.replace(/^data:.*;base64,/, '');
      attachments.push({
        filename: fileName,
        content: Buffer.from(base64Data, 'base64'),
      });
    }

    const mailOptions = {
      from: senderAddress,
      to: toEmail,
      subject: `[LAPORAN AUTOMATED BACKUP] ${reportLabel} - ${new Date().toLocaleDateString('id-ID')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: #38bdf8;">PETERNAKAN UNGGUL MANDIRI</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Sistem Informasi & Pendataan Broiler Berbasis Kloter</p>
          </div>

          <div style="padding: 20px 0;">
            <p style="font-size: 14px; color: #1e293b; margin-bottom: 12px;">Halo <strong>${recipientName}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Laporan otomatis backup data sistem <strong>${reportLabel}</strong> telah berhasil diterbitkan dan siap diunduh.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin: 16px 0;">
              <table style="width: 100%; font-size: 12px; color: #334155;">
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; width: 130px;">Jenis Berkas:</td>
                  <td>${reportLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Nama Lampiran:</td>
                  <td><code>${fileName}</code></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Waktu Pengiriman:</td>
                  <td>${new Date().toLocaleString('id-ID')} WIB</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; color: #64748b;">
              Lampiran berkas telah terlampir pada email ini. Silakan unduh untuk keperluan arsip dan disaster recovery.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">Pesan otomatis dari Sistem Pendataan Ayam Broiler. Mohon tidak membalas email ini.</p>
          </div>
        </div>
      `,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null;

    res.json({
      success: true,
      isSimulated: isEthereal,
      messageId: info.messageId,
      previewUrl,
      message: isEthereal
        ? `Laporan '${reportLabel}' berhasil dikirim ke Mail Server (Web Inbox Preview Siap)!`
        : `Laporan '${reportLabel}' berhasil dikirimkan langsung ke inbox ${toEmail}!`,
      details: {
        toEmail,
        recipientName,
        reportLabel,
        fileName,
        sentAt: new Date().toISOString(),
        previewUrl,
        note: isEthereal
          ? 'Email terkirim ke server SMTP. Klik tombol "Buka & Lihat Email di Web Inbox" untuk melihat tampilan email asli beserta lampiran file.'
          : 'Email terkirim langsung ke inbox Gmail/SMTP tujuan.',
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
