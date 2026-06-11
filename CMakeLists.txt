cmake_minimum_required(VERSION 3.20)
project(octatouch_sdk_core VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(octatouch_core
    core/src/Types.cpp
    core/src/FingerTracker.cpp
    core/src/GestureRecognizer.cpp
    core/src/IntentResolver.cpp
    core/src/GestureEngine.cpp
)

target_include_directories(octatouch_core
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/core/include
)

target_compile_options(octatouch_core
    PRIVATE
        -Wall
        -Wextra
        -Wpedantic
)

add_executable(octatouch_smoke_test tests/unit/smoke_test.cpp)
target_link_libraries(octatouch_smoke_test PRIVATE octatouch_core)
