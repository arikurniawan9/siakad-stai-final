<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'roles' => 'array',
        ];
    }

    /**
     * Dapatkan seluruh daftar peran pengguna (primer + sekunder)
     */
    public function getAllRoles(): array
    {
        $all = [];
        if (!empty($this->role)) {
            $all[] = strtolower($this->role);
        }
        if (is_array($this->roles)) {
            foreach ($this->roles as $r) {
                if (!empty($r)) {
                    $all[] = strtolower($r);
                }
            }
        } elseif (is_string($this->roles)) {
            $decoded = json_decode($this->roles, true);
            if (is_array($decoded)) {
                foreach ($decoded as $r) {
                    if (!empty($r)) $all[] = strtolower($r);
                }
            }
        }

        $unique = array_values(array_unique($all));
        return !empty($unique) ? $unique : ['mahasiswa'];
    }

    /**
     * Periksa apakah pengguna memiliki peran tertentu
     */
    public function hasRole(string|array $checkRoles): bool
    {
        $userRoles = $this->getAllRoles();
        if (in_array('superadmin', $userRoles, true)) {
            return true; // Superadmin bypass
        }

        $checkList = is_array($checkRoles) ? $checkRoles : [$checkRoles];
        foreach ($checkList as $cr) {
            $cr = strtolower(trim($cr));
            if (in_array($cr, $userRoles, true)) {
                return true;
            }
            // Alias handling
            if ($cr === 'adminakademik' && in_array('admin_akademik', $userRoles, true)) return true;
            if ($cr === 'admin_akademik' && in_array('adminakademik', $userRoles, true)) return true;
        }

        return false;
    }

    /**
     * Periksa apakah pengguna memiliki lebih dari satu peran aktif
     */
    public function hasMultipleRoles(): bool
    {
        return count($this->getAllRoles()) > 1;
    }

    /**
     * Relasi ke Dosen PA Pembimbing
     */
    public function academicAdvisor()
    {
        return $this->belongsTo(User::class, 'academic_advisor_id');
    }

    /**
     * Relasi ke Mahasiswa yang dibimbing (khusus Dosen PA)
     */
    public function advisedStudents()
    {
        return $this->hasMany(User::class, 'academic_advisor_id');
    }
}
