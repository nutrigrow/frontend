// ─── Spesialis Data Types ─────────────────────────────────────────────────────

export interface JadwalSpesialis {
  hari: string[]
  waktu: string[]
}

export interface Spesialis {
  id: number
  nama: string
  gelar: string
  spesialisasi: string
  pengalamanTahun: number
  harga: {
    videoCall: number
    chat: number
  }
  foto: string
  pendidikan: string[]
  registrasiMedis: string
  tentang: string
  bidangKeahlian: string[]
  jadwal: JadwalSpesialis
  nextAvailable: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const SPESIALIS_CATEGORIES = [
  'Semua',
  'Spesialis Anak',
  'Kehamilan',
  'Ibu Menyusui',
  'Nutrisi Olahraga',
  'Tumbuh Kembang',
  'MPASI',
]

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const DUMMY_SPESIALIS: Spesialis[] = [
  {
    id: 1,
    nama: 'Dr. Sarah Jenkins',
    gelar: 'Ph.D., RDN',
    spesialisasi: 'Spesialis Anak',
    pengalamanTahun: 12,
    harga: { videoCall: 85000, chat: 45000 },
    foto: 'https://images.unsplash.com/photo-1675270690434-aa99f4871e8a?w=400&q=80',
    pendidikan: [
      'Ph.D. Nutritional Sciences, Stanford University',
      'Board Certified Holistic Nutritionist',
    ],
    registrasiMedis: 'STR: 1234567890',
    tentang:
      'Pendekatan saya terhadap nutrisi sangat berakar pada keyakinan bahwa makanan adalah fondasi ekologi keseluruhan kita. Saya tidak percaya pada diet restriktif satu ukuran untuk semua. Sebaliknya, saya fokus pada pemahaman lanskap fisiologis Anda dan menciptakan strategi berkelanjutan yang terintegrasi dengan kehidupan Anda.\n\nSetelah lebih dari satu dekade meneliti hubungan mendalam antara mikrobioma usus dan fungsi kognitif, praktik saya menekankan makanan utuh, beragam, berbasis tanaman. Kita akan bekerja sama untuk membangun ekosistem internal yang kuat yang mendukung energi, kejernihan mental, dan vitalitas jangka panjang.',
    bidangKeahlian: [
      'Irritable Bowel Syndrome (IBS)',
      'Autoimmune Protocol (AIP)',
      'Hormonal Imbalance',
      'Gut Health',
    ],
    jadwal: {
      hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
      waktu: [
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:30 - 12:30',
        '13:00 - 14:00',
        '14:30 - 15:30',
        '16:00 - 17:00',
      ],
    },
    nextAvailable: 'Hari ini, 16:00',
  },
  {
    id: 2,
    nama: 'Marcus Thorne',
    gelar: 'M.S., CSSD',
    spesialisasi: 'Nutrisi Olahraga',
    pengalamanTahun: 8,
    harga: { videoCall: 95000, chat: 50000 },
    foto: 'https://images.unsplash.com/photo-1756699279298-c89cdef354ab?w=400&q=80',
    pendidikan: [
      'M.S. Exercise Physiology, UCLA',
      'Certified Sports Dietitian (CSSD)',
    ],
    registrasiMedis: 'STR: 9876543210',
    tentang:
      'Mantan pelatih atletik yang beralih menjadi ahli nutrisi olahraga. Berspesialisasi dalam pemberian nutrisi untuk atlet berprestasi tinggi, membantu mereka mencapai puncak performa melalui strategi gizi yang tepat.\n\nDengan pengalaman 8 tahun bekerja bersama atlet profesional dan amatir, Marcus memahami kebutuhan energi unik dari berbagai cabang olahraga dan membantu kliennya mengoptimalkan komposisi tubuh, pemulihan, dan ketahanan.',
    bidangKeahlian: [
      'Performance Nutrition',
      'Recovery Optimization',
      'Body Composition',
      'Endurance Sports',
    ],
    jadwal: {
      hari: ['Senin', 'Rabu', 'Jumat', 'Sabtu'],
      waktu: [
        '07:00 - 08:00',
        '09:00 - 10:00',
        '11:00 - 12:00',
        '14:00 - 15:00',
        '16:00 - 17:00',
      ],
    },
    nextAvailable: 'Besok, 09:00',
  },
  {
    id: 3,
    nama: 'Elena Rodriguez',
    gelar: 'RDN, LD',
    spesialisasi: 'Spesialis Anak',
    pengalamanTahun: 10,
    harga: { videoCall: 110000, chat: 60000 },
    foto: 'https://images.unsplash.com/photo-1612944095914-33fd0a85fcfc?w=400&q=80',
    pendidikan: [
      'M.S. Pediatric Nutrition, Harvard University',
      'Registered Dietitian Nutritionist (RDN)',
    ],
    registrasiMedis: 'STR: 1122334455',
    tentang:
      'Elena bekerja dengan keluarga untuk mengatasi picky eating, alergi makanan, dan masalah pertumbuhan anak. Ia menciptakan rencana makan yang menyenangkan dan bergizi yang disukai anak-anak.\n\nDengan pendekatan keluarga-sentris, Elena memastikan bahwa perubahan pola makan menjadi pengalaman positif bagi seluruh keluarga, bukan hanya si anak.',
    bidangKeahlian: [
      'Childhood Nutrition & Allergies',
      'Picky Eating Solutions',
      'Growth Development',
      'MPASI Introduction',
    ],
    jadwal: {
      hari: ['Selasa', 'Kamis', 'Sabtu'],
      waktu: [
        '09:00 - 10:00',
        '10:30 - 11:30',
        '13:00 - 14:00',
        '15:00 - 16:00',
      ],
    },
    nextAvailable: 'Hari ini, 15:00',
  },
  {
    id: 4,
    nama: 'Dr. Elena Rostova',
    gelar: 'M.D., Ph.D.',
    spesialisasi: 'Kehamilan',
    pengalamanTahun: 15,
    harga: { videoCall: 120000, chat: 65000 },
    foto: 'https://images.unsplash.com/photo-1673865641073-4479f93a7776?w=400&q=80',
    pendidikan: [
      'M.D. Obstetric Nutrition, Moscow State Medical',
      'Ph.D. Maternal-Fetal Nutrition, Cambridge University',
    ],
    registrasiMedis: 'STR: 5544332211',
    tentang:
      'Dokter klinis senior yang berspesialisasi dalam nutrisi ibu hamil dan menyusui dengan pengalaman 15 tahun. Menggunakan pendekatan berbasis bukti untuk memastikan ibu dan bayi mendapatkan nutrisi optimal.\n\nDr. Rostova adalah penulis beberapa publikasi ilmiah tentang nutrisi maternal dan telah membantu ribuan ibu hamil mencapai kehamilan yang sehat.',
    bidangKeahlian: [
      'Maternal Nutrition',
      'Prenatal Care',
      'Gestational Diabetes',
      'Fetal Development Nutrition',
    ],
    jadwal: {
      hari: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
      waktu: [
        '08:00 - 09:00',
        '10:00 - 11:00',
        '13:00 - 14:00',
        '15:00 - 16:00',
      ],
    },
    nextAvailable: 'Besok, 08:00',
  },
  {
    id: 5,
    nama: 'Dr. Michael Chen',
    gelar: 'M.D., IBCLC',
    spesialisasi: 'Ibu Menyusui',
    pengalamanTahun: 9,
    harga: { videoCall: 90000, chat: 55000 },
    foto: 'https://images.unsplash.com/photo-1758691463605-f4a3a92d6d37?w=400&q=80',
    pendidikan: [
      'M.D. Pediatrics, Johns Hopkins University',
      'International Board Certified Lactation Consultant (IBCLC)',
    ],
    registrasiMedis: 'STR: 6677889900',
    tentang:
      'Spesialis laktasi dan nutrisi pasca melahirkan yang membantu ibu menyusui dengan sukses. Dr. Chen dikenal karena pendekatannya yang empatik dan solusi praktis untuk tantangan menyusui sehari-hari.\n\nDengan pengalaman menangani lebih dari 2000 kasus laktasi, Dr. Chen mampu memberikan dukungan komprehensif untuk memastikan perjalanan menyusui yang positif.',
    bidangKeahlian: [
      'Lactation Support',
      'Postpartum Nutrition',
      'Breastfeeding Challenges',
      'Milk Supply Issues',
    ],
    jadwal: {
      hari: ['Senin', 'Rabu', 'Jumat'],
      waktu: [
        '10:00 - 11:00',
        '13:00 - 14:00',
        '14:30 - 15:30',
        '16:00 - 17:00',
      ],
    },
    nextAvailable: 'Hari ini, 14:30',
  },
  {
    id: 6,
    nama: 'Dr. Sinta Permata',
    gelar: 'Sp.A., M.Kes',
    spesialisasi: 'MPASI',
    pengalamanTahun: 6,
    harga: { videoCall: 80000, chat: 40000 },
    foto: 'https://images.unsplash.com/photo-1536064479547-7ee40b74b807?w=400&q=80',
    pendidikan: [
      'Dokter Spesialis Anak, Universitas Indonesia',
      'M.Kes Nutrisi Klinik, FKUI Jakarta',
    ],
    registrasiMedis: 'STR: 3344556677',
    tentang:
      'Spesialis MPASI yang membantu orang tua dalam memperkenalkan makanan padat kepada bayi dengan cara yang aman, menyenangkan, dan sesuai usia. Dr. Sinta percaya bahwa pengalaman makan pertama bayi membentuk kebiasaan makan seumur hidup.\n\nDengan panduan yang terstruktur dan berbasis sains, Dr. Sinta membantu keluarga menciptakan rutinitas makan yang positif dari hari pertama MPASI.',
    bidangKeahlian: [
      'Baby Led Weaning (BLW)',
      'MPASI Homemade',
      'Alergi Makanan Bayi',
      'Jadwal MPASI Terstruktur',
    ],
    jadwal: {
      hari: ['Selasa', 'Kamis', 'Sabtu'],
      waktu: ['09:00 - 10:00', '11:00 - 12:00', '13:30 - 14:30'],
    },
    nextAvailable: 'Besok, 09:00',
  },
  {
    id: 7,
    nama: 'Dr. Fatimah Azzahra',
    gelar: 'Sp.OG., M.Gizi',
    spesialisasi: 'Kehamilan',
    pengalamanTahun: 7,
    harga: { videoCall: 85000, chat: 45000 },
    foto: 'https://images.unsplash.com/photo-1737792837727-fd46ff71acf2?w=400&q=80',
    pendidikan: [
      'Dokter Spesialis Obstetri & Ginekologi, UNAIR',
      'M.Gizi Nutrisi Maternal, FK UNAIR Surabaya',
    ],
    registrasiMedis: 'STR: 7788990011',
    tentang:
      'Dokter kandungan yang juga ahli gizi maternal, membantu ibu hamil mendapatkan nutrisi optimal untuk tumbuh kembang janin yang sehat. Dr. Fatimah menggabungkan keahlian medis obstetri dengan pengetahuan mendalam tentang nutrisi.\n\nBeliau memberikan konsultasi holistik yang mencakup perencanaan diet kehamilan, manajemen berat badan, dan pencegahan komplikasi nutrisi selama kehamilan.',
    bidangKeahlian: [
      'Nutrisi Per Trimester',
      'Kontrol Berat Badan Hamil',
      'Diabetes Gestasional',
      'Anemia Kehamilan',
    ],
    jadwal: {
      hari: ['Senin', 'Rabu', 'Jumat'],
      waktu: ['08:00 - 09:00', '10:00 - 11:00', '14:00 - 15:00'],
    },
    nextAvailable: 'Hari ini, 10:00',
  },
  {
    id: 8,
    nama: 'Dr. Andi Wijaya',
    gelar: 'M.Sc., RD',
    spesialisasi: 'Tumbuh Kembang',
    pengalamanTahun: 11,
    harga: { videoCall: 100000, chat: 55000 },
    foto: 'https://images.unsplash.com/photo-1746813628081-0c8c1611aace?w=400&q=80',
    pendidikan: [
      'M.Sc. Child Nutrition, Wageningen University',
      'Registered Dietitian (RD), Indonesia',
    ],
    registrasiMedis: 'STR: 8899001122',
    tentang:
      'Ahli nutrisi tumbuh kembang yang berdedikasi membantu anak mencapai potensi optimal melalui pola makan seimbang dan intervensi gizi tepat sasaran. Dr. Andi memiliki keahlian khusus dalam penanganan stunting dan malnutrisi pada anak.\n\nBeliau bekerja sama dengan tim multidisiplin untuk memastikan penanganan tumbuh kembang anak yang komprehensif dan berkelanjutan.',
    bidangKeahlian: [
      'Pencegahan Stunting',
      'Nutrisi Balita',
      'Tumbuh Kembang Optimal',
      'Intervensi Malnutrisi',
    ],
    jadwal: {
      hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
      waktu: [
        '08:30 - 09:30',
        '10:00 - 11:00',
        '13:00 - 14:00',
        '15:00 - 16:00',
      ],
    },
    nextAvailable: 'Besok, 08:30',
  },
  {
    id: 9,
    nama: 'Dr. Linda Hartono',
    gelar: 'Ph.D., RDN',
    spesialisasi: 'Ibu Menyusui',
    pengalamanTahun: 13,
    harga: { videoCall: 115000, chat: 60000 },
    foto: 'https://images.unsplash.com/photo-1675270882554-ab6817fb44f3?w=400&q=80',
    pendidikan: [
      'Ph.D. Nutritional Biochemistry, NUS Singapore',
      'Certified Lactation Educator Counselor (CLEC)',
    ],
    registrasiMedis: 'STR: 9900112233',
    tentang:
      'Pakar nutrisi menyusui dengan pengalaman 13 tahun membantu ibu mendapatkan produksi ASI optimal dan memastikan bayi tumbuh dengan sehat. Dr. Linda dikenal karena pendekatannya yang sabar dan komprehensif dalam mendampingi ibu baru.\n\nDengan latar belakang riset biokimia nutrisi, Dr. Linda mampu menjelaskan proses fisiologi menyusui dengan cara yang mudah dipahami oleh ibu.',
    bidangKeahlian: [
      'ASI Eksklusif & Optimasi',
      'Nutrisi Ibu Menyusui',
      'Produksi & Kualitas ASI',
      'Weaning Strategies',
    ],
    jadwal: {
      hari: ['Selasa', 'Kamis'],
      waktu: [
        '09:00 - 10:00',
        '11:00 - 12:00',
        '14:00 - 15:00',
        '16:00 - 17:00',
      ],
    },
    nextAvailable: 'Lusa, 09:00',
  },
]

// ─── Helper: Format harga ──────────────────────────────────────────────────────
export const formatHarga = (angka: number): string =>
  `Rp ${angka.toLocaleString('id-ID')}`