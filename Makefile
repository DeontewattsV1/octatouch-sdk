BUILD_DIR := build

.PHONY: init build test clean test-latency

init:
	@mkdir -p $(BUILD_DIR)

build: init
	@cmake -S . -B $(BUILD_DIR)
	@cmake --build $(BUILD_DIR)

test: build
	@./$(BUILD_DIR)/octatouch_smoke_test

test-latency:
	@echo "Latency harness scaffold only. Add target-specific benchmarks in tests/latency/."

clean:
	@rm -rf $(BUILD_DIR)
