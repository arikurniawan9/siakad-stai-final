<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal Otomatis: Pencadangan Database SIAKAD Setiap Hari Pukul 01:00 WIB
Schedule::command('siakad:backup-database --retention=14')
    ->dailyAt('01:00')
    ->runInBackground();

