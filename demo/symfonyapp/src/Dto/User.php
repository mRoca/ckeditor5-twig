<?php

namespace App\Dto;

class User
{
    // Private properties with getter
    private string $firstname;
    private string $lastname;
    private \DateTime $birthdate;

    /**
     * @var PostalAddress|null the user postal address, if we know it
     */
    private ?PostalAddress $address = null;

    /**
     * Is the user enabled?
     */
    private bool $isEnabled = true;

    /**
     * The user's favorites numbers as an array of float. Why not!
     *
     * @var array|float[]
     */
    private array $favoriteNumbers = [];

    // Private properties without getter

    private string $password;

    // Getters

    public function getFirstname(): string
    {
        return $this->firstname;
    }

    public function getLastname(): string
    {
        return $this->lastname;
    }

    public function getBirthdate(): \DateTime
    {
        return $this->birthdate;
    }

    public function getAddress(): ?PostalAddress
    {
        return $this->address;
    }

    public function isEnabled(): bool
    {
        return $this->isEnabled;
    }

    /**
     * @return float[]
     */
    public function getFavoriteNumbers(): array
    {
        return $this->favoriteNumbers;
    }
}
