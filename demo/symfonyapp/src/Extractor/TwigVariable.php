<?php

namespace App\Extractor;

/**
 * TwigVariable is a representation of a CKEditor Twig plugin variable.
 */
class TwigVariable implements \JsonSerializable
{
    public const TYPE_OBJECT = 'object';
    public const TYPE_ARRAY = 'array';
    public const TYPE_STRING = 'string';
    public const TYPE_BOOLEAN = 'boolean';
    public const TYPE_INTEGER = 'integer';
    public const TYPE_FLOAT = 'float';
    public const TYPE_DATETIME = 'datetime';
    public const TYPE_UNKNOWN = 'unknown';

    public static array $TYPES = [
        self::TYPE_OBJECT,
        self::TYPE_ARRAY,
        self::TYPE_STRING,
        self::TYPE_BOOLEAN,
        self::TYPE_INTEGER,
        self::TYPE_FLOAT,
        self::TYPE_DATETIME,
        self::TYPE_UNKNOWN,
    ];

    public string $type;
    public bool $nullable = false;
    public ?string $label = null;

    /**
     * Children object must only be set when type === "array".
     */
    public ?TwigVariable $children = null;

    /**
     * Properties associative array must only be set when type === "object".
     *
     * @var TwigVariable[]
     */
    public array $properties = [];

    /**
     * TwigVariable constructor.
     *
     * @param TwigVariable|TwigVariable[] $childrenOrProperties
     */
    public function __construct(string $type, ?string $label = null, bool $nullable = false, $childrenOrProperties = null)
    {
        if ('bool' === $type) {
            $type = self::TYPE_BOOLEAN;
        }
        if ('int' === $type) {
            $type = self::TYPE_INTEGER;
        }

        if (!in_array($type, self::$TYPES, true)) {
            throw new \InvalidArgumentException("Invalid twig variable type: $type");
        }

        $this->type = $type;
        $this->label = $label;
        $this->nullable = $nullable;

        if (self::TYPE_OBJECT === $type && is_array($childrenOrProperties)) {
            $this->properties = $childrenOrProperties;
        }

        if (self::TYPE_ARRAY === $type && $childrenOrProperties instanceof self) {
            $this->children = $childrenOrProperties;
        }
    }

    public function jsonSerialize(): array
    {
        return array_filter([
            'type' => $this->type,
            'label' => $this->label,
            'nullable' => $this->nullable,
            'children' => $this->children,
            'properties' => $this->properties,
        ], static fn ($value) => null !== $value && !(is_array($value) && empty($value)));
    }

    public static function create(array $data): self
    {
        if (!empty($data['properties'])) {
            foreach ($data['properties'] as $key => $propertyType) {
                $data['properties'][$key] = self::create($data['properties'][$key]);
            }
        }

        if (is_array($data['children'] ?? null)) {
            $data['children'] = self::create($data['children']);
        }

        return new self(
            $data['type'] ?? self::TYPE_UNKNOWN,
            $data['label'] ?? null,
            $data['nullable'] ?? false,
            $data['properties'] ?? $data['children'] ?? null,
        );
    }
}
