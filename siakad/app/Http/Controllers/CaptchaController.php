<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CaptchaController extends Controller
{
    /**
     * Pembangkitan Captcha 4 Digit Alfanumerik (Bebas Karakter Ambigu)
     */
    public function generate(Request $request): JsonResponse
    {
        // Karakter bebas ambigu (tanpa 0, 1, O, I)
        $charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $code = '';
        $length = 4;
        
        for ($i = 0; $i < $length; $i++) {
            $code .= $charset[random_int(0, strlen($charset) - 1)];
        }

        // Simpan hash di session (berlaku 5 menit)
        $hash = hash_hmac('sha256', strtoupper($code), config('app.key'));
        session([
            'captcha_hash' => $hash,
            'captcha_expires_at' => now()->addMinutes(5)->timestamp,
        ]);

        // Buat gambar SVG dinamis dengan garis noise visual & rotasi
        $width = 160;
        $height = 54;
        
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'.$width.'" height="'.$height.'" viewBox="0 0 '.$width.' '.$height.'">';
        $svg .= '<rect width="100%" height="100%" fill="#F1F5F9" rx="8"/>';
        
        // Garis-garis noise
        for ($i = 0; $i < 4; $i++) {
            $x1 = random_int(0, $width);
            $y1 = random_int(0, $height);
            $x2 = random_int(0, $width);
            $y2 = random_int(0, $height);
            $svg .= '<line x1="'.$x1.'" y1="'.$y1.'" x2="'.$x2.'" y2="'.$y2.'" stroke="#CBD5E1" stroke-width="1.5"/>';
        }

        // Titik-titik dot matrix noise
        for ($i = 0; $i < 25; $i++) {
            $cx = random_int(0, $width);
            $cy = random_int(0, $height);
            $r = random_int(1, 2);
            $svg .= '<circle cx="'.$cx.'" cy="'.$cy.'" r="'.$r.'" fill="#94A3B8" opacity="0.4"/>';
        }

        // Render karakter dengan sudut rotasi acak
        $colors = ['#1B365D', '#107C41', '#0F766E', '#1E293B'];
        $charX = 22;
        
        for ($i = 0; $i < $length; $i++) {
            $char = $code[$i];
            $color = $colors[$i % count($colors)];
            $rotate = random_int(-15, 15);
            $charY = random_int(34, 38);
            
            $svg .= '<text x="'.$charX.'" y="'.$charY.'" fill="'.$color.'" font-family="Plus Jakarta Sans, Arial Black, sans-serif" font-weight="900" font-size="26" transform="rotate('.$rotate.', '.$charX.', '.$charY.')">'.$char.'</text>';
            $charX += 32;
        }

        $svg .= '</svg>';
        $base64 = 'data:image/svg+xml;base64,' . base64_encode($svg);

        return response()->json([
            'success' => true,
            'captcha_image' => $base64,
        ]);
    }
}
