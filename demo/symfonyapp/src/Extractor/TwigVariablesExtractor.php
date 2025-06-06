<?php

namespace App\Extractor;

use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\Extractor\SerializerExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractorInterface;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactory;
use Symfony\Component\Serializer\Mapping\Loader\AttributeLoader;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\BuiltinType;
use Symfony\Component\TypeInfo\Type\CollectionType;
use Symfony\Component\TypeInfo\Type\NullableType;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\Type\UnionType;
use Symfony\Component\TypeInfo\TypeIdentifier;

/**
 * TwigVariablesExtractor allows transforming a PHP value into a list of CKEditor Twig plugin variables.
 */
class TwigVariablesExtractor
{
    private const int DEFAULT_CIRCULAR_REFERENCE_LIMIT = 1;
    private const int DEFAULT_MAX_DEPTH = 4;
    protected int $circularReferenceLimit = self::DEFAULT_CIRCULAR_REFERENCE_LIMIT;
    protected int $maxDepth = self::DEFAULT_MAX_DEPTH;

    public const array SCALAR_TYPES_MAPPING = [
        TypeIdentifier::STRING->value => TwigVariable::TYPE_STRING,
        TypeIdentifier::BOOL->value => TwigVariable::TYPE_BOOLEAN,
        TypeIdentifier::INT->value => TwigVariable::TYPE_INTEGER,
        TypeIdentifier::FLOAT->value => TwigVariable::TYPE_FLOAT,
        TypeIdentifier::OBJECT->value => TwigVariable::TYPE_OBJECT,
        TypeIdentifier::ARRAY->value => TwigVariable::TYPE_ARRAY,
    ];

    /**
     * @param array{circular_reference_limit?: int, max_depth?: int} $options
     */
    public function __construct(protected ?PropertyInfoExtractorInterface $propertyInfoExtractor = null, array $options = [])
    {
        $this->propertyInfoExtractor ??= self::createPropertyInfoExtractor();

        if (array_key_exists('circular_reference_limit', $options)) {
            $this->circularReferenceLimit = (int) $options['circular_reference_limit'];
        }

        if (array_key_exists('max_depth', $options)) {
            $this->maxDepth = (int) $options['max_depth'];
        }
    }

    /**
     * Extracts the Twig plugin variables from an array or an object.
     *
     * @param array<string, mixed>|object         $items
     * @param array{serializer_groups?: string[]} $context ['serializer_groups' => ['foo']]
     *
     * @return TwigVariable[]
     */
    public function extract(array|object $items, array $context = []): array
    {
        if (is_array($items)) {
            foreach ($items as $key => $type) {
                $items[$key] = $this->extractItemInfos($type, $context);
            }

            return $items;
        }

        if (is_object($items)) {
            return $this->extractItemInfos($items, $context)->properties;
        }

        throw new \InvalidArgumentException('You must pass an array or an object to the extract function');
    }

    protected static function createPropertyInfoExtractor(): PropertyInfoExtractorInterface
    {
        $serializerClassMetadataFactory = new ClassMetadataFactory(new AttributeLoader());
        $serializerExtractor = new SerializerExtractor($serializerClassMetadataFactory);

        $phpDocExtractor = new PhpDocExtractor();
        $reflectionExtractor = new ReflectionExtractor();

        $listExtractors = [$serializerExtractor, $reflectionExtractor];
        $typeExtractors = [$phpDocExtractor, $reflectionExtractor];
        $descriptionExtractors = [$phpDocExtractor];
        $accessExtractors = [$reflectionExtractor];
        $propertyInitializableExtractors = [$reflectionExtractor];

        return new PropertyInfoExtractor(
            $listExtractors,
            $typeExtractors,
            $descriptionExtractors,
            $accessExtractors,
            $propertyInitializableExtractors
        );
    }

    protected function extractItemInfos(mixed $item, array $context = []): TwigVariable
    {
        // Type per name
        if (is_string($item) && in_array($item, TwigVariable::TYPES, true)) {
            return new TwigVariable($item);
        }

        // Object by class name
        if (is_string($item) && class_exists($item)) {
            return $this->extractObjectInfos($item, $context);
        }

        // Object
        if (is_object($item)) {
            return $this->extractObjectInfos(get_class($item), $context);
        }

        // Scalar
        if (is_scalar($item) && in_array(gettype($item), TwigVariable::TYPES, true)) {
            return new TwigVariable(gettype($item));
        }

        // Array with variable config
        if (is_array($item) && in_array($item['type'] ?? null, TwigVariable::TYPES, true)) {
            return TwigVariable::create($item);
        }

        // Array with 1 item as content type
        if (is_array($item) && 1 === count($item) && 0 === array_key_first($item)) {
            return new TwigVariable(TwigVariable::TYPE_ARRAY, null, false, $this->extractItemInfos($item[0], $context));
        }

        // Associative array as object
        if (is_array($item)) {
            /** @var TwigVariable[] $properties */
            $properties = array_map(fn ($propertyType) => $this->extractItemInfos($propertyType, $context), $item);

            return new TwigVariable(TwigVariable::TYPE_OBJECT, null, false, $properties);
        }

        return new TwigVariable(TwigVariable::TYPE_UNKNOWN);
    }

    protected function extractObjectInfos(string $className, array $context = []): TwigVariable
    {
        if (!class_exists($className)) {
            return new TwigVariable(TwigVariable::TYPE_OBJECT);
        }

        // Datetime
        if (is_subclass_of($className, \DateTimeInterface::class)) {
            return new TwigVariable(TwigVariable::TYPE_DATETIME);
        }

        if ($this->isMaxDepth($className, $context)) {
            return new TwigVariable(TwigVariable::TYPE_OBJECT);
        }

        $context['parents'][] = $className;

        /** @var array<string, TwigVariable> $properties */
        $properties = array_flip($this->propertyInfoExtractor->getProperties($className, $context) ?: []);
        foreach ($properties as $key => $nothing) {
            $properties[$key] = $this->propertyInfoTypeToTwigVariable($this->propertyInfoExtractor->getType($className, $key), $context);
        }

        return new TwigVariable(TwigVariable::TYPE_OBJECT, null, false, $properties);
    }

    protected function isMaxDepth(string $currentClass, array $context): bool
    {
        if (array_count_values($context['parents'] ?? [])[$currentClass] ?? 0 > $this->circularReferenceLimit) {
            return true;
        }
        if (count($context['parents'] ?? []) >= $this->maxDepth) {
            return true;
        }

        return false;
    }

    protected function propertyInfoTypeToTwigVariable(?Type $type, array $context = []): TwigVariable
    {
        // No typehint
        if (null === $type) {
            return new TwigVariable(TwigVariable::TYPE_UNKNOWN);
        }

        // Nullable type: let's get the inner type
        $nullable = $type->isNullable();
        if ($type instanceof NullableType) {
            $type = $type->getWrappedType();
            $nullable = true;
        }

        // Array, lists, iterators, ...
        // Key type is ignored for now.
        if (self::isListType($type)) {
            // We ignore the array key type for now, maybe later?

            /** @var Type|null $valuesType The first not null collection items type */
            $valuesType = self::getListItemsType($type);

            return new TwigVariable(TwigVariable::TYPE_ARRAY, null, $nullable, $this->propertyInfoTypeToTwigVariable($valuesType, $context));
        }

        // Scalar types
        if ($type instanceof BuiltinType && array_key_exists($type->getTypeIdentifier()->value, self::SCALAR_TYPES_MAPPING)) {
            return new TwigVariable(self::SCALAR_TYPES_MAPPING[$type->getTypeIdentifier()->value], null, $nullable);
        }

        // Object
        if ($type instanceof ObjectType) {
            // Datetime
            if (is_subclass_of($type->getClassName(), \DateTimeInterface::class)) {
                return new TwigVariable(TwigVariable::TYPE_DATETIME, null, $nullable);
            }

            return new TwigVariable(TwigVariable::TYPE_OBJECT, null, $nullable, $this->extractObjectInfos($type->getClassName(), $context)->properties);
        }

        // Ignoring UnionType that is not a list for now
        return new TwigVariable(TwigVariable::TYPE_UNKNOWN, null, $nullable);
    }

    private static function isListType(Type $type): bool
    {
        if ($type instanceof CollectionType) {
            return true;
        }

        // If the type is a union, we need to check that all the inner types are collection types.
        if ($type instanceof UnionType) {
            return (bool) array_product(array_map(self::isListType(...), $type->getTypes()));
        }

        if (!$type instanceof ObjectType) {
            return false;
        }

        $className = $type->getClassName();

        // Iterator is a special case
        if (in_array($className, ['iterator', 'Traversable'])) {
            return true;
        }

        if (!class_exists($className)) {
            return false;
        }

        $reflection = new \ReflectionClass($className);

        return $reflection->isIterable() || $reflection->implementsInterface(\Traversable::class);
    }

    private static function getListItemsType(Type $type): ?Type
    {
        if ($type instanceof CollectionType) {
            return $type->getCollectionValueType();
        }

        // If all the types have the same type, we use it (array|Foobar[]). Else, it's an unknown type (array|object).
        if ($type instanceof UnionType) {
            $innerTypes = array_map(self::getListItemsType(...), $type->getTypes());
            $validInnerTypes = array_filter($innerTypes, function (?Type $innerType) {
                if (null === $innerType) {
                    return false;
                }
                // Ignoring mixed types. If only mixed types are found, we return null, which will be converted to UNKNOWN
                if ($innerType instanceof BuiltinType && TypeIdentifier::MIXED === $innerType->getTypeIdentifier()) {
                    return false;
                }

                // Let's keep other values
                return true;
            });

            // Only one type found, we return it.
            if (1 === count($validInnerTypes)) {
                return $validInnerTypes[array_key_first($validInnerTypes)];
            }

            // Many types found
            return null;
        }

        // No type founds
        return null;
    }
}
