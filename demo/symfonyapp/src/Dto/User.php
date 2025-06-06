<?php

namespace App\Dto;

class User
{
    // Private properties with getter
    private string $firstname;
    private ?string $lastname;
    private \DateTime $birthdate;

    // Public properties

    /**
     * @var PostalAddress|null the user postal address, if we know it
     */
    public ?PostalAddress $address = null;

    /**
     * Is the user enabled?
     */
    public bool $isEnabled = true;

    /**
     * Another user that manages this user to test recursivity.
     */
    public User $manager;

    /**
     * The user's favorite numbers as an array of float. Why not!
     *
     * @var array|float[]
     */
    public array $favoriteNumbers = [];

    // Private properties without getter

    private string $password;

    // Getters

    public function getFirstname(): string
    {
        return $this->firstname;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function getBirthdate(): \DateTime
    {
        return $this->birthdate;
    }
}
