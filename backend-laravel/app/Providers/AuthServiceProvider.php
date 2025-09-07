<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use App\Models\Disposisi;
use App\Models\Notulen;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Policies\DisposisiPolicy;
use App\Policies\NotulenPolicy;
use App\Policies\SuratKeluarPolicy;
use App\Policies\SuratMasukPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Disposisi::class => DisposisiPolicy::class,
        SuratMasuk::class => SuratMasukPolicy::class,
        SuratKeluar::class => SuratKeluarPolicy::class,
        Notulen::class => NotulenPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Grant all abilities to users whose jabatan is Admin
        Gate::before(function ($user, $ability) {
            // Ensure relation exists and is loaded
            if (method_exists($user, 'jabatan') && $user->jabatan && $user->jabatan->nama_jabatan === 'Admin') {
                return true;
            }
            return null;
        });

        $this->registerPolicies();

        //
    }
}
