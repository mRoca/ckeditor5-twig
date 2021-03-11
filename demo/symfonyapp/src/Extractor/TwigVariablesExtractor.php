<?php

namespace App\Extractor;

use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractorInterface;
use Symfony\Component\PropertyInfo\Type;

/**
 * TwigVariablesExtractor allows to transform a PHP value into a list of CKEditor Twig plugin variables.
 */
class TwigVariablesExtractor
{
    private const DEFAULT_CIRCULAR_REFERENCE_LIMIT = 1;
    private const DEFAULT_MAX_DEPTH = 4;

    protected PropertyInfoExtractorInterface $propertyInfoExtractor;
    protected int $circularReferenceLimit = self::DEFAULT_CIRCULAR_REFERENCE_LIMIT;
    protected int $maxDepth = self::DEFAULT_MAX_DEPTH;

    public function __construct(PropertyInfoExtractorInterface $propertyInfoExtractor = null, array $options = [])
    {
        $this->propertyInfoExtractor = $propertyInfoExtractor ?: self::createPropertyInfoExtractor();

        if (array_key_exists('circular_reference_limit', $options)) {
            $this->circularReferenceLimit = (int) $options['circular_reference_limit'];
        }

        if (array_key_exists('max_depth', $options)) {
            $this->maxDepth = (int) $options['max_depth'];
        }
    }

    protected static function createPropertyInfoExtractor(): PropertyInfoExtractorInterface
    {
        $phpDocExtractor = new PhpDocExtractor();
        $reflectionExtractor = new ReflectionExtractor();

        $listExtractors = [$reflectionExtractor];
        $typeExtractors = [$phpDocExtractor, $reflectionExtractor];
        $descriptionExtractors = [$phpDocExtractor];
        $carryccessExtractors = [$reflectionExtractor];
        $propertyInitializableExtractors = [$reflectionExtractor];

        return new PropertyInfoExtractor(
            $listExtractors,
            $typeExtractors,
            $descriptionExtractors,
            $carryccessExtractors,
            $propertyInitializableExtractors
        );
    }

    /**
     * @param array|object $items
     *
     * @return TwigVariable[]
     */
    public function extract($items): array
    {
        if (is_array($items)) {
            foreach ($items as $key => $type) {
                $items[$key] = $this->extractItemInfos($type);
            }

            return $items;
        }

        if (is_object($items)) {
            return $this->extractItemInfos($items)->properties;
        }

        throw new \InvalidArgumentException('You must pass an array or an object to the extract function');
    }

    protected function extractItemInfos($item): TwigVariable
    {
        // Type per name
        if (is_string($item) && in_array($item, TwigVariable::$TYPES, true)) {
            return new TwigVariable($item);
        }

        // Object by class name
        if (is_string($item) && class_exists($item)) {
            return $this->extractObjectInfos($item);
        }

        // Object
        if (is_object($item)) {
            return $this->extractObjectInfos(get_class($item));
        }

        // Scalar
        if (is_scalar($item) && in_array(gettype($item), TwigVariable::$TYPES, true)) {
            return new TwigVariable(gettype($item));
        }

        // Array with variable config
        if (is_array($item) && in_array($item['type'] ?? null, TwigVariable::$TYPES, true)) {
            return TwigVariable::create($item);
        }

        // Array with 1 item as content type
        if (is_array($item) && 1 === count($item) && 0 === array_key_first($item)) {
            return new TwigVariable(TwigVariable::TYPE_ARRAY, null, false, $this->extractItemInfos($item[0]));
        }

        // Associative array as object
        if (is_array($item)) {
            /** @var TwigVariable[] $properties */
            $properties = [];
            foreach ($item as $key => $propertyType) {
                $properties[$key] = $this->extractItemInfos($propertyType);
            }

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
        $properties = array_flip($this->propertyInfoExtractor->getProperties($className));
        foreach ($properties as $key => $nothing) {
            $properties[$key] = $this->propertyInfoTypeToTwigVariable($this->propertyInfoExtractor->getTypes($className, $key), $context);
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

    /**
     * @param Type[]|null $infoTypes
     */
    protected function propertyInfoTypeToTwigVariable(?array $infoTypes, array $context = []): TwigVariable
    {
        // The extractor can find 0, 1 or more types. E.G.: array|Foobar[]
        if (empty(array_filter($infoTypes ?: []))) {
            return new TwigVariable(TwigVariable::TYPE_UNKNOWN);
        }

        // If all detected types are nullable, it's nullable
        $nullable = (bool) array_reduce($infoTypes, static fn (bool $carry, Type $cur) => $carry && $cur->isNullable(), true);

        // Array
        $isCollection = (bool) array_reduce($infoTypes, static fn (bool $carry, Type $cur) => $carry && $cur->isCollection(), true);
        if ($isCollection) {
            // We ignore the collection key type for now, maybe later ?
            /** @var Type|null $valueType The first not null collection items type */
            $valueType = array_reduce($infoTypes, static fn (?Type $carry, Type $cur) => $carry ?: $cur->getCollectionValueType());

            return new TwigVariable(TwigVariable::TYPE_ARRAY, null, $nullable, $this->propertyInfoTypeToTwigVariable([$valueType], $context));
        }

        // Scalar
        // If all the types have the same type, we use it (array|Foobar[]). Else, it's an unknown type (array|object).
        $type = array_reduce($infoTypes, static fn (?string $carry, Type $cur) => null === $carry || $carry === $cur->getBuiltinType() ? $cur->getBuiltinType() : TwigVariable::TYPE_UNKNOWN);
        if (in_array($type, [TwigVariable::TYPE_UNKNOWN, Type::BUILTIN_TYPE_BOOL, Type::BUILTIN_TYPE_FLOAT, Type::BUILTIN_TYPE_INT, Type::BUILTIN_TYPE_STRING], true)) {
            return new TwigVariable($type, null, $nullable);
        }

        // Object
        if (Type::BUILTIN_TYPE_OBJECT === $type) {
            /** @var string|null $objectClass The first not null found object class */
            $objectClass = array_reduce($infoTypes, static fn (?string $carry, Type $cur) => $carry ?: $cur->getClassName());

            if (null === $objectClass) {
                return new TwigVariable(TwigVariable::TYPE_OBJECT, null, $nullable);
            }

            // Datetime
            if (is_subclass_of($objectClass, \DateTimeInterface::class)) {
                return new TwigVariable(TwigVariable::TYPE_DATETIME, null, $nullable);
            }

            return new TwigVariable(TwigVariable::TYPE_OBJECT, null, $nullable, $this->extractObjectInfos($objectClass, $context)->properties);
        }

        return new TwigVariable(TwigVariable::TYPE_UNKNOWN, null, $nullable);
    }
}
