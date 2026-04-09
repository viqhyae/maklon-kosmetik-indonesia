@extends('front.master')

@section('title',       'Cek Keaslian Produk - Maklon Kosmetik Indonesia')
@section('descripsi',   'Cek keaslian produk kosmetik, skincare, & parfum Anda. Pastikan produk asli PT Maklon Kosmetik Indonesia (Standar BPOM & CPKB)')
@section('keyword',     '')


@section('content')
    <nav class="navbar bg-light">
        <div class="container">
            <a class="navbar-brand" href="https://maklonkosmetik.co.id">
                <img src="{{ asset('img/LOGO_TOP.png') }}" alt="Maklon Kosmetik Indonesia">
            </a>
            <a class="float-right" href="http://wa.me/6285182025567" style="position: fixed;z-index: 99;bottom: 15px;right: 15px;">
                <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="color-element" cx="19.4395" cy="19.4395" r="19.4395" fill="#49E670"></circle><path d="M12.9821 10.1115C12.7029 10.7767 11.5862 11.442 10.7486 11.575C10.1902 11.7081 9.35269 11.8411 6.84003 10.7767C3.48981 9.44628 1.39593 6.25317 1.25634 6.12012C1.11674 5.85403 2.13001e-06 4.39053 2.13001e-06 2.92702C2.13001e-06 1.46351 0.83755 0.665231 1.11673 0.399139C1.39592 0.133046 1.8147 1.01506e-06 2.23348 1.01506e-06C2.37307 1.01506e-06 2.51267 1.01506e-06 2.65226 1.01506e-06C2.93144 1.01506e-06 3.21063 -2.02219e-06 3.35022 0.532183C3.62941 1.19741 4.32736 2.66092 4.32736 2.79397C4.46696 2.92702 4.46696 3.19311 4.32736 3.32616C4.18777 3.59225 4.18777 3.59224 3.90858 3.85834C3.76899 3.99138 3.6294 4.12443 3.48981 4.39052C3.35022 4.52357 3.21063 4.78966 3.35022 5.05576C3.48981 5.32185 4.18777 6.38622 5.16491 7.18449C6.42125 8.24886 7.39839 8.51496 7.81717 8.78105C8.09636 8.91409 8.37554 8.9141 8.65472 8.648C8.93391 8.38191 9.21309 7.98277 9.49228 7.58363C9.77146 7.31754 10.0507 7.1845 10.3298 7.31754C10.609 7.45059 12.2841 8.11582 12.5633 8.38191C12.8425 8.51496 13.1217 8.648 13.1217 8.78105C13.1217 8.78105 13.1217 9.44628 12.9821 10.1115Z" transform="translate(12.9597 12.9597)" fill="#FAFAFA"></path><path d="M0.196998 23.295L0.131434 23.4862L0.323216 23.4223L5.52771 21.6875C7.4273 22.8471 9.47325 23.4274 11.6637 23.4274C18.134 23.4274 23.4274 18.134 23.4274 11.6637C23.4274 5.19344 18.134 -0.1 11.6637 -0.1C5.19344 -0.1 -0.1 5.19344 -0.1 11.6637C-0.1 13.9996 0.624492 16.3352 1.93021 18.2398L0.196998 23.295ZM5.87658 19.8847L5.84025 19.8665L5.80154 19.8788L2.78138 20.8398L3.73978 17.9646L3.75932 17.906L3.71562 17.8623L3.43104 17.5777C2.27704 15.8437 1.55796 13.8245 1.55796 11.6637C1.55796 6.03288 6.03288 1.55796 11.6637 1.55796C17.2945 1.55796 21.7695 6.03288 21.7695 11.6637C21.7695 17.2945 17.2945 21.7695 11.6637 21.7695C9.64222 21.7695 7.76778 21.1921 6.18227 20.039L6.17557 20.0342L6.16817 20.0305L5.87658 19.8847Z" transform="translate(7.7758 7.77582)" fill="white" stroke="white" stroke-width="0.2"></path></svg>
            </a>
        </div>
    </nav>
    <div class="container-fluid hero" style="background:#F2F2F2 url('{{ asset('img/back-product-mki.png') }}');">
        <div class="container">
            <div class="row">
                <div class="col-sm-5 col-lg-5"></div>
                <div class="col-sm-7 col-lg-7 isi" style="">
                    <h1 class="mt-5">Cek Keaslian Produk</h1>
                    <p class="mb-5 dek" style="font-size: 18px">
                        Terima kasih banyak telah mempercayakan pilihan Anda akan produk kami. <br>
                        Kami akan terus menciptakan produk berkualitas tinggi untuk Anda. <br>
                        Gunakan halaman ini untuk verifikasi keaslian produk dengan <br>
                        masukkan kode unik yang tertera pada kemasan untuk verifikasi produk. 
                    </p>
                    <br><br>
                    <div class="col-12 col-sm-8">
                        <form action="{{ route('kode') }}" method="POST" id="idForm">
                            {{ csrf_field() }}
                            <input type="hidden" name="latitude" id="scan-latitude">
                            <input type="hidden" name="longitude" id="scan-longitude">
                            <div class="input-group mb-3">
                                <input type="text" name="kode" class="form-control" placeholder="Masukkan kode verifikasi" style="font-size: 28px;text-transform: uppercase;" aria-label="Masukkan verifikasi kode" aria-describedby="button-addon2">
                                <button style=" background: #c2986b; border-color: #c2986b" class="btn btn-success" type="submit" id="button-addon2" style="font-size: 18px;">CEK</button>
                            </div>
                        </form>
                    </div>
                    <small class='dek' style=" margin-top: 100px; margin-bottom: -80px; ">
                        Contoh hasil cek verifikasi kode : 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/pertama.png') }}" width="290px">
                            </span>
                            pertama
                        </div>
                        , 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/kedua.png') }}" width="290px">
                            </span>
                            kedua
                        </div>
                        , 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/ketiga.png') }}" width="290px">
                            </span>
                            ketiga
                        </div>
                        , 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/waspada.png') }}" width="290px">
                            </span>
                            keempat dan seterusnya
                        </div>
                        , atau 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/gagal.png') }}" width="290px">
                            </span>
                            gagal    
                        </div>
                    </small>
                    <p class="mb-1 mob" style="font-size: 18px">
                        Terima kasih banyak telah mempercayakan pilihan Anda akan produk kami. 
                        Kami akan terus menciptakan produk berkualitas tinggi untuk Anda.
                        Gunakan halaman ini untuk verifikasi keaslian produk dengan
                        masukkan kode unik yang tertera pada kemasan untuk verifikasi produk. 
                    </p>
                    <small class='mob' style=" margin-top: 30px;">
                        Contoh hasil cek verifikasi kode : <br>
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/pertama.png') }}" width="290px">
                            </span>
                            pertama
                        </div>
                        ,
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/kedua.png') }}" width="290px">
                            </span>
                            kedua
                        </div>
                        , 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/ketiga.png') }}" width="290px">
                            </span>
                            ketiga
                        </div>
                        , 
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/waspada.png') }}" width="290px">
                            </span>
                            keempat dan seterusnya
                        </div>
                        , atau <br>
                        <div class="tooltipku" style="z-index:99">
                            <span class="tooltiptext" style=" width: 300px; margin-left: -150px; background: #fff; border: 2px solid #111; ">
                                <img src="{{ asset('img/gagal.png') }}" width="290px">
                            </span>
                            gagal    
                        </div>
                    </small>
                </div>
    
                <div class="col-12">
                    <br><br>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <p style="color:#C1986B" class="text-center mt-5">Proses Verifikasi</p>
        <h2 class="text-center">
            3 Langkah <span style="color:#C1986B">Cek Keaslian Produk</span>
        </h2>
        <p class="text-center">Beri perlindungan maksimal akan brand dan kepercayaan pelanggan dengan label anti pemalsuan. Ikuti tiga langkah mudah berikut untuk melakukan verifikasi produk.</p><br>
        <div class="row row-eq-height">
            <div class="col-sm-12 col-md-4">
                <img src="{{ asset('img/qr-mki.png') }}" width="150px" class="mx-auto" style="display:block">
                <div class="blok-cek">
                    <h3 class='optima-bold font-orange' style=" font-size: 24px; ">1. Scan QR Code</h3>
                    <p class="mb-0" style=" text-align: justify; ">
                        Pindai QR code yang ada pada kemasan dengan menggunakan smart phone, atau kunjungi: <br><br>
                        <span class='font-orange'>https://cek.maklonkosmetik.co.id</span>
                    </p>
                </div>
            </div>
            <div class="col-sm-12 col-md-4">
                <div style=" height: 150px; display: flex; align-items: center; flex-wrap: wrap; align-content: center; ">
                    <img src="{{ asset('img/kode-mki.png') }}" width="300px" class="mx-auto" style="display:block">
                </div>
                <div class="blok-cek">
                    <h3 class='optima-bold font-orange' style=" font-size: 24px; ">2. Gosok Label Pelindung</h3>
                    <p class="mb-0"style=" text-align: justify; ">
                        Ungkap tujuh digit kode di balik label pelindung. Label pelindung memberikan jaminan bahwa Anda adalah orang pertama yang menggunakan kode verifikasi tersebut.
                    </p>
                </div>
            </div>
            <div class="col-sm-12 col-md-4">
                <div style=" height: 150px; display: flex; align-items: center; flex-wrap: wrap; align-content: center; ">
                    <img src="{{ asset('img/cek-mki.png') }}" width="300px" class="mx-auto" style="display:block">
                </div>
                <div class="blok-cek">
                    <h3 class='optima-bold font-orange' style=" font-size: 24px; ">3. Verifikasi Data</h3>
                    <p class="mb-0" style=" text-align: justify; ">
                        Masukan tujuh digit kode ke web untuk verifikasi produk pada sistem yang sulit di retas.
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid" style=" background:#F2F2F2; margin-top:50px">
        <div class="container">
            <div class="row">
                <div class="col-sm-6 col-lg-6">
                    <p style="color:#C1986B" class="mt-5">Tujuan Utama</p>
                    <h2 class="">
                        Lindungi Konsumen Dengan <br><span style="color:#C1986B">Label Anti Pemalsuan</span>
                    </h2>
                    <p class="mb-0 mt-3 mb-5" style=" text-align: justify; ">
                        Salah satu pondasi kesuksesan brand adalah dengan menjaga kepercayaan konsumen. Produk palsu dapat menipu pelanggan, 
                        sehingga memberikan dampak negatif pada bisnis Anda. Konsumen yang merasa dikhianati bahkan mungkin mencari alternatif produk dari pesaing.
                        <br><br>
                        Untuk menjaga kepercayaan pelanggan, kami menerapkan sistem cek produk unik untuk mencegah pemalsuan produk. Ini adalah bentuk komitmen kami 
                        untuk terus memberikan solusi yang baik dalam memastikan produk sesuai dengan kualitas dan ketentuan yang berlaku.
                    </p>
                </div>
                <div class="col-sm-6 col-lg-6 ml-auto d-flex align-items-center mt-4 mt-md-0">
                    <div style="">
                        <div class="dek"><br><br><br><br><br></div>
                        <img src="{{ asset('img/img-mki.png') }}" width="90%" class="mx-auto" style="display:block">
                        <br><br>
                        <div class="mob"><br></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container-fluid" style="margin-top:50px">
        <div class="container">
            <p style="color:#C1986B" class="text-center mt-5">Perbandingan Fitur</p>
            <h2 class="text-center">
                Hologram Konvensional vs.  <span style="color:#C1986B">Label Keaslian Produk</span>
            </h2>
            <p>
                PT. Maklon Kosmetik Indonesia berdiri pada tahun 2023 di Surabaya, Jawa Timur, yang merupakan industri Perseroan Terbatas yang melayani jasa maklon, bergerak pada bidang produksi kosmetika. 
            </p>
            <table class="table table-striped">
                <tr>
                    <th>
                        
                    </th>
                    <th>
                        Hologram Konvensional
                    </th>
                    <th>
                        Label Keaslian Produk
                    </th>
                </tr>
                <tr>
                    <td>
                        Desain Sesuai Brand
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-hijau-mki.png') }}" width="20px">
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-hijau-mki.png') }}" width="20px">
                    </td>
                </tr>
                <tr>
                    <td>
                        Mudah Dilihat
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-hijau-mki.png') }}" width="20px">
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-hijau-mki.png') }}" width="20px">
                    </td>
                </tr>
                <tr>
                    <td>
                        Jaminan Kode Unik Tiap Produk
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-abu-mki.png') }}" width="20px">
                    </td>
                    <td class="text-center">
                        <img src="{{ asset('img/cek-hijau-mki.png') }}" width="20px">
                    </td >
                </tr>
            </table>
        </div>
    </div>
    
    <div class="container-fluid" style=" background:#F2F2F2; margin-top:50px">
        <div class="container">
            <div class="row row-eq-height">
                <div class='col-12'>
                    <p style="color:#C1986B" class="mt-5">Kelebihan</p>
                    <h2 class="">
                        Fitur <span style="color:#C1986B">Label Anti Pemalsuan</span>
                    </h2>
                    <p class="mb-0 mt-3 mb-4" style=" text-align: justify; ">
                        PT. Maklon Kosmetik Indonesia berdiri pada tahun 2023 di Surabaya, Jawa Timur, yang merupakan industri Perseroan Terbatas yang melayani jasa maklon, bergerak pada bidang produksi kosmetika. 
                    </p>
                </div>
                <div class="col-sm-4 col-lg-4">
                    <div class="blok-fitur">
                        <img src="{{ asset('img/keamanan-mki.png') }}" style=" height: 140px; width: auto; "><br><br>
                        <h3 class="optima-bold font-orange" style=" font-size: 24px; ">Keamanan Tinggi</h3>
                        <p class="mb-0">
                            Label anti pemalsuan dirancang khusus 
                            untuk mencegah pemalsuan produk dan 
                            memberikan perlindungan maksimal 
                            untuk produk.
                        </p>
                    </div>
                </div>
                <div class="col-sm-4 col-lg-4">
                    <div class="blok-fitur">
                        <img src="{{ asset('img/verifikasi-mki.png') }}" style=" height: 140px; width: auto; "><br><br>
                        <h3 class="optima-bold font-orange" style=" font-size: 24px; ">Verifikasi Online</h3>
                        <p class="mb-0">
                            Setiap label anti pemalsuan dilengkapi 
                            dengan QR code dan kode cek yang unik 
                            untuk memeriksa keaslian produk 
                            secara online.
                        </p>
                    </div>
                </div>
                <div class="col-sm-4 col-lg-4">
                    <div class="blok-fitur">
                        <img src="{{ asset('img/implementasi-mki.png') }}" style=" height: 140px; width: auto; "><br><br>
                        <h3 class="optima-bold font-orange" style=" font-size: 24px; ">Implementasi Mudah</h3>
                        <p class="mb-0">
                            Label anti pemalsuan mudah 
                            beradaptasi ke berbagai produk, mudah 
                            di aplikasikan ke berbagai media.
                        </p>
                    </div>
                </div>
                
                <div class='col-12'>
                    <br><br>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container-fluid" style=" background:#FFF; margin-top:50px">
        <div class="container">
            <div class="row">
                
                <div class="col-sm-6 col-lg-6 ml-auto d-flex align-items-center mt-4 mt-md-0">
                    
                </div>
                
                <div class="col-sm-6 col-lg-6">
                    <p style="color:#C1986B" class="mt-5">Keuntungan</p>
                </div>
                
            </div>
            <div class="row">
                
                <div class="col-sm-6 col-lg-6 ml-auto d-flex align-items-center mt-4 mt-md-0">
                    <div style="">
                        <br>
                        <img src="{{ asset('img/keuntungan-mki.png') }}" width="90%" class="mx-auto" style="display:block">
                        <br><br>
                    </div>
                </div>
                
                <div class="col-sm-6 col-lg-6">
                    
                    <h2 class="">
                        Mengapa Menggunakan <br><span style="color:#C1986B">Label Anti Pemalsuan?</span>
                    </h2>
                    <p class="mb-0 mt-3 mb-3" style=" text-align: justify; ">
                        Label anti pemalsuan lebih dari sekedar hiasan. Dengan label anti pemalsuan, kami membantu memastikan produk Anda aman dari pemalsuan serta memberikan nilai tambah pada brand usaha.
                    </p>
                    <ul class='list-gold'>
                        <li>
                            Perlindungan Penuh Terhadap Produk Anda
                        </li>
                        <li>
                            Meningkatkan Kepercayaan Pelanggan
                        </li>
                        <li>
                            Mencegah Dampak Kerugian Finansial
                        </li>
                        <li>
                            Menjaga Reputasi Brand
                        </li>
                    </ul>
                </div>
                
            </div>
        </div>
    </div>
    
    <div class="container-fluid" style=" background:#F2F2F2; margin-top:50px">
        <div class="container">
            <div class="row row-eq-height">
                <div class='col-12 text-center'>
                    <p style="color:#C1986B" class="mt-5">Frequently Asked Questions</p>
                    <h2 class="">
                        FAQ <span style="color:#C1986B">Label Anti Pemalsuan</span>
                    </h2>
                    <p class="mb-0 mt-3 mb-4" style=" text-align: justify; ">
                        Label anti pemalsuan memberikan solusi terbaik untuk mencegah pemalsuan produk, memberikan perlindungan kepercayaan pelanggan akan produk asli dan berkualitas.
                    </p>
                </div>
                
                <div class='col-12'>
                    <div class="accordion" id="accordionExample">
                      <div class="accordion-item">
                        <div class="accordion-header">
                          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Tentang Label Anti Pemalsuan
                          </button>
                        </div>
                        <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                          <div class="accordion-body">
                              Label anti pemalsuan kami adalah stiker dengan kode unik khusus yang kami pasang pada kemasan produk Anda. Setiap stiker ini unik dan dilengkapi dengan dua elemen kunci untuk pengamanan keunikan produk: lapisan pelindung yang perlu digosok (scratch-off) dan 6 digit nomor PIN rahasia yang biasanya tersembunyi di bawahnya. 6 digit nomor PIN rahasia inilah yang digunakan untuk memeriksa keaslian produk via website verifikasi kami.
                          </div>
                        </div>
                      </div>
                      <div class="accordion-item">
                        <div class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Mengapa Menggunakan Label Anti Pemalsuan
                          </button>
                        </div>
                        <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                          <div class="accordion-body">
                              Karena label ini menggabungkan keamanan fisik dengan verifikasi digital unik (PIN rahasia per produk), membuatnya jauh lebih sulit dipalsukan dibanding label hologram biasa atau kode cetak saja. Ini memberikan cara yang sangat mudah dan cepat bagi konsumen untuk memastikan produk di tangan mereka asli, langsung membangun kepercayaan, dan secara signifikan melindungi brand Anda dari peredaran produk palsu.
                          </div>
                        </div>
                      </div>
                      <div class="accordion-item">
                        <div class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            Teknologi Di Balik Label
                          </button>
                        </div>
                        <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                          <div class="accordion-body">
                              Scan QR atau kunjungi situs verifikasi kami (<a href='https://cek.maklonkosmetik.co.id'>cek.maklonkosmetik.co.id</a>), lalu masukkan 6 digit PIN dari bawah lapisan gosok (scratch-off). Sistem akan langsung menampilkan status keaslian produk. Ingat, setiap kode hanya bisa dicek maksimal 3 kali.
                          </div>
                        </div>
                      </div>
                      <div class="accordion-item">
                        <div class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThreea" aria-expanded="false" aria-controls="collapseThreea">
                            Kustomisasi Label
                          </button>
                        </div>
                        <div id="collapseThreea" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                          <div class="accordion-body">
                              Ya, label ini dapat disesuaikan. Kami bisa mengintegrasikan logo dan elemen desain brand Anda. Anda juga bisa memilih jenis bahan sticker lain yang kami sediakan agar sesuai dengan kebutuhan dan tampilan brand Anda.
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
                
                <div class='col-12'>
                    <br><br>
                </div>
            </div>
        </div>
    </div>
    {{--<div class="container">
        <div class="row">
            <div class="col-6" style="padding: 40px;">
                <h4>CARA MENGECEK KEASLIAN PRODUK ANDA!</h4> <br>
                <img src="https://cek.adevnatural.co.id/themes/pages/assets/img/Example-Produk-Blur1.jpg" alt="" width="80%">
            </div>
            <div class="col-6" style=" background: #c2986b; padding: 40px; color: #fff; ">
                <h4>PETUNJUK CARA CEK KEASLIAN PRODUK.</h4> <br>
                Masukan Kode Kedalam Form (Lihat Gambar untuk melihat Kode pada Kemasan).
                <br><br>
                *Note : Untuk Kode Produk diawal dan diakhir adalah HURUF bukan ANGKA.
                <br><br>
                Tutorial cara cek keaslian bisa dilihat disini 
                <br><br>
                Untuk Pertanyaan Lebih lanjut bisa menghubungi <br>
                Call Center Kami : <br>
                Telp (0251) 7539769 <br>
                WhatsApp Chat silahkan tekan tombol KLIK : 

            </div>
        </div>
    </div>--}}
@endsection
