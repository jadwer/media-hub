<?php
// archivo: tests/Api/V1ApiTest.php

use PHPUnit\Framework\TestCase;

class V1ApiTest extends TestCase
{
    private function callApi(array $params): array
    {
        $_GET = $params;

        ob_start();
        include BASE_PATH . '/api/v1.php';
        $output = ob_get_clean();

        $decoded = json_decode($output, true);

        if (!is_array($decoded)) {
            throw new \RuntimeException("Invalid JSON returned:\n" . $output);
        }

        return $decoded;
    }

    public function testReturnsAudioFiles()
    {
        $result = $this->callApi(['type' => 'audio', 'page' => 1]);

        $this->assertIsArray($result);
        $this->assertEquals('audio', $result['type']);
        $this->assertArrayHasKey('files', $result);
    }

    public function testHandlesInvalidTypeGracefully()
    {
        $result = $this->callApi(['type' => 'fake', 'page' => 1]);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('files', $result);
        $this->assertEmpty($result['files']);
    }

    public function testPaginationAndOrdering()
    {
        $result = $this->callApi(['type' => 'audio', 'page' => 1, 'perPage' => 2, 'order' => 'name_asc']);

        $this->assertLessThanOrEqual(2, count($result['files']));
        if (count($result['files']) === 2) {
            $this->assertLessThanOrEqual(
                0,
                strcmp($result['files'][0]['name'], $result['files'][1]['name'])
            );
        }
    }
}
