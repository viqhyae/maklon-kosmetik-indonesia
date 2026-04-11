<!doctype html>
<html lang="en">

    <head>
        <!--====== Required meta tags ======-->
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="description" content="@yield('descripsi')">
        <meta name="keyword" content="@yield('keyword')">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>@yield('title')</title>
        <!--====== Title ======-->
        @yield('css')
        <meta name="robots" content="index, follow">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
        </style>

        <link href="{{ asset('css/styles.css') }}" rel="stylesheet">
        <link rel="canonical" href="https://cek.maklonkosmetik.co.id/" />
        <link rel="apple-touch-icon" sizes="57x57" href="{{ asset('assets/icon/apple-icon-57x57.png') }}">
        <link rel="apple-touch-icon" sizes="60x60" href="{{ asset('assets/icon/apple-icon-60x60.png') }}">
        <link rel="apple-touch-icon" sizes="72x72" href="{{ asset('assets/icon/apple-icon-72x72.png') }}">
        <link rel="apple-touch-icon" sizes="76x76" href="{{ asset('assets/icon/apple-icon-76x76.png') }}">
        <link rel="apple-touch-icon" sizes="114x114" href="{{ asset('assets/icon/apple-icon-114x114.png') }}">
        <link rel="apple-touch-icon" sizes="120x120" href="{{ asset('assets/icon/apple-icon-120x120.png') }}">
        <link rel="apple-touch-icon" sizes="144x144" href="{{ asset('assets/icon/apple-icon-144x144.png') }}">
        <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('assets/icon/apple-icon-152x152.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('assets/icon/apple-icon-180x180.png') }}">
        <link rel="icon" type="image/png" sizes="192x192"  href="{{ asset('assets/icon/android-icon-192x192.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/icon/favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="96x96" href="{{ asset('assets/icon/favicon-96x96.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('assets/icon/favicon-16x16.png') }}">
        <link rel="manifest" href="{{ asset('assets/icon/manifest.json') }}">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="{{ asset('assets/icon//ms-icon-144x144.png') }}">
        <meta name="theme-color" content="#ffffff">
        
        <style>
            div:where(.swal2-container) button:where(.swal2-styled).swal2-confirm {
                background-color: #c2986b !important;
            }
        </style>
    </head>
    

    <body>

        @yield('content')
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
        <script src="{{ asset('js/jquery-3.7.1.min.js') }}"></script>
        <script>

            var geolocationOptions = {
                enableHighAccuracy: true,
                timeout: 4500,
                maximumAge: 0
            };
            var geolocationFallbackOptions = {
                enableHighAccuracy: false,
                timeout: 2000,
                maximumAge: 60000
            };
            var MAX_GEO_RETRY = 1;
            var MAX_ACCEPTABLE_ACCURACY_METERS = 1200;
            var requireGpsForScan = @json(isset($requireGps) ? (bool) $requireGps : false);

            var setScanCoordinates = function(latitude, longitude) {
                $("#scan-latitude").val(latitude);
                $("#scan-longitude").val(longitude);
            };

            var hasScanCoordinates = function() {
                var latitude = String($("#scan-latitude").val() || '').trim();
                var longitude = String($("#scan-longitude").val() || '').trim();
                return latitude !== '' && longitude !== '';
            };

            var requestBrowserPosition = function(options) {
                return new Promise(function(resolve, reject) {
                    navigator.geolocation.getCurrentPosition(resolve, reject, options);
                });
            };

            var resolveScanCoordinates = function() {
                return new Promise(function(resolve, reject) {
                    if (!navigator.geolocation) {
                        reject('Browser Anda tidak mendukung akses lokasi GPS.');
                        return;
                    }

                    var attempt = 0;
                    var tryResolve = function() {
                        attempt += 1;

                        requestBrowserPosition(geolocationOptions)
                            .catch(function() {
                                return requestBrowserPosition(geolocationFallbackOptions);
                            })
                            .then(function(position) {
                                if (!position || !position.coords) {
                                    reject('Lokasi GPS tidak terbaca. Aktifkan izin lokasi lalu coba lagi.');
                                    return;
                                }

                                var latitude = Number(position.coords.latitude);
                                var longitude = Number(position.coords.longitude);
                                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                                    reject('Koordinat lokasi tidak valid. Aktifkan GPS lalu coba lagi.');
                                    return;
                                }

                                var accuracy = Number(position.coords.accuracy);
                                if (
                                    Number.isFinite(accuracy) &&
                                    accuracy > MAX_ACCEPTABLE_ACCURACY_METERS
                                ) {
                                    if (attempt < MAX_GEO_RETRY) {
                                        tryResolve();
                                        return;
                                    }

                                    reject('Akurasi GPS masih rendah. Pindah ke area terbuka lalu coba lagi.');
                                    return;
                                }

                                setScanCoordinates(latitude.toFixed(6), longitude.toFixed(6));
                                resolve({
                                    latitude: latitude.toFixed(6),
                                    longitude: longitude.toFixed(6)
                                });
                            })
                            .catch(function() {
                                reject('Izin lokasi wajib diaktifkan untuk verifikasi kode.');
                            });
                    };

                    tryResolve();
                });
            };

            if (requireGpsForScan) {
                resolveScanCoordinates().catch(function() {
                    Swal.fire({
                        icon: "info",
                        title: "Izin Lokasi Diperlukan",
                        text: "Silakan aktifkan izin lokasi (GPS) agar verifikasi kode dapat diproses."
                    });
                });
            }

            $("#idForm").submit(function(e) {
                // avoid to execute the actual submit of the form.
                e.preventDefault();

                var form = $(this);
                var actionUrl = form.attr('action');

                var executeVerification = function(allowRetryWithCoordinates) {
                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        success: function(xml, textStatus, xhr){
                            if(xhr.status == 200){
                                if(xml.ke == 0){
                                    Swal.fire({
                                        title: "BERHASIL",
                                        html: `Terima kasih telah mempercayakan pilihan Anda akan produk kami.<br> <br>
                                            <b>Verifikasi kode yang pertama (1/3)</b><br><br> 
                                            Silakan menikmati produk Anda. <br><br>
                                            Total Verifikasi : `+(xml.ke+1)+`  dari 3 kali<br>
                                            Verifikasi pertama : `+xml.tgl+` <br>
                                            Verifikasi kedua : - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br>
                                            Verifikasi ketiga : - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `,
                                        icon: "success"
                                    });
                                }
                                else if(xml.ke == 1){
                                    Swal.fire({
                                        title: "BERHASIL",
                                        html: `Terima kasih telah mempercayakan pilihan Anda akan produk kami.<br> <br>
                                            <b>Verifikasi kode yang kedua (2/3) </b><br><br> 
                                            Silakan menikmati produk Anda. <br><br>
                                            Total Verifikasi : `+(xml.ke+1)+`  dari 3 kali<br>
                                            Verifikasi pertama : `+xml.tgl+` <br>
                                            Verifikasi kedua : `+xml.tgl2+` <br>
                                            Verifikasi ketiga : - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `,
                                        icon: "success"
                                    });
                                }
                                else if(xml.ke == 2){
                                    Swal.fire({
                                        title: "BERHASIL",
                                        html: `Terima kasih telah mempercayakan pilihan Anda akan produk kami.<br> <br>
                                            <b>Verifikasi kode yang ketiga (3/3)</b><br><br> 
                                            Silakan menikmati produk Anda. <br><br>
                                            Total Verifikasi : `+(xml.ke+1)+`  dari 3 kali<br>
                                            Verifikasi pertama : `+xml.tgl+` <br>
                                            Verifikasi kedua   : `+xml.tgl2+` <br>
                                            Verifikasi ketiga : `+xml.tgl3,
                                        icon: "success"
                                    });
                                }
                                else if(xml.ke >= 3){
                                    Swal.fire({
                                        icon: "warning",
                                        title: "WASPADA",
                                        html: `Kode telah diverifikasi `+(xml.ke+1)+` kali<br><br>
                                            Verifikasi pertama : `+xml.tgl+` <br>
                                            Verifikasi kedua   : `+xml.tgl2+` <br>
                                            Verifikasi ketiga : `+xml.tgl3,
                                        // footer: '<div class="tooltipku"><span class="tooltiptext">Cek kode pada produk, pastikan kode benar dan sesuai. <br>Jika kode verfikasi tetap mengalami kegagalan, <br>hubungi kami di 085182025567.</span>Kenapa kode saya gagal?</div>'
                                    });
                                }
                                else{
                                    Swal.fire({
                                        title: "PERNAH DIVERIFIKASI",
                                        html: `Terima kasih telah mempercayakan pilihan Anda akan produk kami.<br><br>
                                            Silakan menikmati produk Anda. <br><br>
                                            Total Verifikasi : `+(xml.ke+1)+` dari 3 kali<br>
                                            Waktu verifikasi pertama : `+xml.tgl,
                                        icon: "info",
                                    });
                                }
                            }
                            else{
                                Swal.fire({
                                    icon: "error",
                                    title: "GAGAL",
                                    text: "Kode verifikasi Salah",
                                    footer: '<div class="tooltipku"><span class="tooltiptext">Cek kode pada produk, pastikan kode benar dan sesuai. <br>Jika kode verfikasi tetap mengalami kegagalan, <br>hubungi kami di 085182025567.</span>Kenapa kode saya gagal?</div>'
                                });
                            }
                        },
                        error: function(xhr) {
                            var message = (xhr && xhr.responseJSON && xhr.responseJSON.message)
                                ? xhr.responseJSON.message
                                : "Terjadi kendala saat memeriksa kode. Silakan coba lagi.";
                            var shouldRetryWithCoordinates = Boolean(
                                allowRetryWithCoordinates &&
                                xhr &&
                                xhr.status === 422 &&
                                /izin lokasi wajib/i.test(String(message || '')) &&
                                !hasScanCoordinates()
                            );

                            if (shouldRetryWithCoordinates) {
                                resolveScanCoordinates().then(function() {
                                    executeVerification(false);
                                }).catch(function(resolveMessage) {
                                    Swal.fire({
                                        icon: "warning",
                                        title: "Izin Lokasi Diperlukan",
                                        text: resolveMessage || "Aktifkan izin lokasi (GPS) sebelum verifikasi kode."
                                    });
                                });
                                return;
                            }

                            var title = (xhr && xhr.status === 422) ? "Izin Lokasi Diperlukan" : "GAGAL";
                            var icon = (xhr && xhr.status === 422) ? "warning" : "error";

                            Swal.fire({
                                icon: icon,
                                title: title,
                                text: message
                            });
                        }
                    });
                };

                if (requireGpsForScan && !hasScanCoordinates()) {
                    resolveScanCoordinates().then(function() {
                        executeVerification(false);
                    }).catch(function(message) {
                        Swal.fire({
                            icon: "warning",
                            title: "Izin Lokasi Diperlukan",
                            text: message || "Aktifkan izin lokasi (GPS) sebelum verifikasi kode."
                        });
                    });
                    return;
                }

                executeVerification(!requireGpsForScan);
            });
        </script>
    </body>

</html>
