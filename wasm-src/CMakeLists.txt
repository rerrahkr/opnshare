cmake_minimum_required(VERSION 3.13)
project(synth)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Werror -Wno-unused-parameter")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Werror")

# Add source files
set(YMFM_SRCS
    lib/ymfm/src/ymfm_opn.cpp
    lib/ymfm/src/ymfm_adpcm.cpp
    lib/ymfm/src/ymfm_ssg.cpp
)
file(GLOB MINIAUDIO_SRCS lib/miniaudio/*.c)

file(GLOB_RECURSE SRCS src/*.cpp)

# Create the WASM module
add_executable(${PROJECT_NAME} ${SRCS} ${YMFM_SRCS} ${MINIAUDIO_SRCS})

# Set Emscripten link flags

# Emscripten flags for WASM with SharedArrayBuffer and embind
set(EM_FLAGS
    -s WASM=1
    -s MODULARIZE=1
    -s EXPORT_ES6=0
    -s ENVIRONMENT=web,worker
    -s ALLOW_MEMORY_GROWTH=1
    -s EXPORTED_RUNTIME_METHODS=['HEAPF32']
    -s EXPORT_NAME='createSynthModule'
    -lembind
    --emit-tsd=synth.d.ts
    --no-entry
    -O3
)
string(REPLACE ";" " " EM_FLAGS "${EM_FLAGS}")
set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS "${EM_FLAGS}")

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE lib/ymfm/src)
target_include_directories(${PROJECT_NAME} PRIVATE lib/miniaudio)
