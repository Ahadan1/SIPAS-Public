<?php

namespace App\Policies;

use App\Models\Disposisi;
use App\Models\User;
use App\Models\SuratMasuk;
use Illuminate\Auth\Access\HandlesAuthorization;

class DisposisiPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow anyone to view the list, will be filtered by service/controller
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Disposisi $disposisi): bool
    {
        // User can view a disposition if they sent it or received it.
        return $user->id === $disposisi->pengirim_id || $user->id === $disposisi->penerima_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, SuratMasuk $suratMasuk): bool
    {
        // User can create a disposition if they can view the related incoming mail.
        return $user->can('view', $suratMasuk);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Disposisi $disposisi): bool
    {
        // Only the user who sent the disposition can update it.
        return $user->id === $disposisi->pengirim_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Disposisi $disposisi): bool
    {
        // Only the user who sent the disposition can delete it.
        return $user->id === $disposisi->pengirim_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Disposisi $disposisi): bool
    {
        return false; // Or implement logic if needed
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Disposisi $disposisi): bool
    {
        return false; // Or implement logic if needed
    }
}