<?php

namespace App\Policies;

use App\Models\Notulen;
use App\Models\User;

class NotulenPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Notulen $notulen): bool
    {
        return $user->jabatan->kode_uk === $notulen->kode_uk;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Notulen $notulen): bool
    {
        return $user->jabatan->kode_uk === $notulen->kode_uk;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Notulen $notulen): bool
    {
        return $user->jabatan->kode_uk === $notulen->kode_uk;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Notulen $notulen): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Notulen $notulen): bool
    {
        return false;
    }
}

