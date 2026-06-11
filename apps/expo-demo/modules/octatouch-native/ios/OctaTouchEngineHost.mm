#import "OctaTouchEngineHost.h"

#import <Foundation/Foundation.h>

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "../../../../core/include/GestureInputFrame.h"
#include "../../../../core/include/PlatformContext.h"
#include "../../../../core/include/Types.h"
#include "../shared/OctaTouchRealtimeEngine.h"

using octatouch::CapabilityFlags;
using octatouch::GestureInputFrame;
using octatouch::PlatformContext;
using octatouch::RawTouchSample;
using octatouch::ToolType;
using octatouch::VehicleState;
using octatouch::native::IngestResponse;
using octatouch::native::RealtimeGestureEngine;

namespace {
ToolType parseToolType(NSString *value) {
  if ([value isEqualToString:@"stylus"]) {
    return ToolType::Stylus;
  }
  if ([value isEqualToString:@"mouse"]) {
    return ToolType::Mouse;
  }
  return ToolType::Touch;
}

VehicleState parseVehicleState(NSString *value) {
  if ([value isEqualToString:@"driving"]) {
    return VehicleState::Driving;
  }
  if ([value isEqualToString:@"parked"]) {
    return VehicleState::Parked;
  }
  return VehicleState::Unknown;
}

NSDictionary *capabilitiesToDictionary(const CapabilityFlags &flags) {
  return @{
    @"multiTouch": @(flags.multiTouch),
    @"hover": @(flags.hover),
    @"pressure": @(flags.pressure),
    @"stylus": @(flags.stylus),
  };
}

GestureInputFrame parseFrame(NSDictionary *frameDict) {
  GestureInputFrame frame;
  frame.timestamp_us = [frameDict[@"timestamp_us"] unsignedLongLongValue];
  frame.deviceId = [frameDict[@"deviceId"] ?: @"expo-ios" UTF8String];
  frame.toolType = parseToolType(frameDict[@"toolType"] ?: @"touch");

  NSDictionary *capabilities = frameDict[@"capabilities"] ?: @{};
  frame.capabilities = CapabilityFlags{
    [capabilities[@"multiTouch"] boolValue],
    [capabilities[@"hover"] boolValue],
    [capabilities[@"pressure"] boolValue],
    [capabilities[@"stylus"] boolValue],
  };

  NSArray *samples = frameDict[@"samples"] ?: @[];
  frame.samples.reserve(samples.count);
  for (NSDictionary *sampleDict in samples) {
    frame.samples.push_back(RawTouchSample{
      [sampleDict[@"x"] floatValue],
      [sampleDict[@"y"] floatValue],
      [sampleDict[@"pressure"] floatValue],
      [sampleDict[@"contactArea"] floatValue],
      [sampleDict[@"timestamp_us"] unsignedLongLongValue],
      [sampleDict[@"nativeId"] intValue],
    });
  }

  return frame;
}

PlatformContext parseContext(NSDictionary *contextDict) {
  PlatformContext context;
  context.vehicleState = parseVehicleState(contextDict[@"vehicleState"] ?: @"unknown");

  NSDictionary *access = contextDict[@"accessibility"] ?: @{};
  context.accessibility.screenReaderActive = [access[@"screenReaderActive"] boolValue];
  context.accessibility.zoomActive = [access[@"zoomActive"] boolValue];
  context.accessibility.switchControlActive = [access[@"switchControlActive"] boolValue];
  return context;
}

NSArray<NSString *> *toNSArray(const std::vector<std::string> &values) {
  NSMutableArray<NSString *> *result = [NSMutableArray arrayWithCapacity:values.size()];
  for (const auto &value : values) {
    [result addObject:[NSString stringWithUTF8String:value.c_str()]];
  }
  return result;
}

NSArray<NSString *> *fingerSetToNSArray(const octatouch::FingerSet &values) {
  NSMutableArray<NSString *> *result = [NSMutableArray arrayWithCapacity:values.size()];
  for (const auto &value : values) {
    [result addObject:[NSString stringWithUTF8String:octatouch::to_string(value).c_str()]];
  }
  return result;
}

NSDictionary *responseToDictionary(const IngestResponse &response) {
  NSDictionary *live = @{
    @"phase": [NSString stringWithUTF8String:response.live.phase.c_str()],
    @"activeTouches": @(response.live.activeTouches),
    @"candidateGesture": [NSString stringWithUTF8String:response.live.candidateGesture.c_str()],
    @"assignedFingers": toNSArray(response.live.assignedFingers),
    @"centroid": @{
      @"x": @(response.live.centroid.x),
      @"y": @(response.live.centroid.y),
    },
  };

  if (!response.hasResult) {
    return @{
      @"hasResult": @NO,
      @"result": [NSNull null],
      @"live": live,
    };
  }

  const auto &result = response.result;
  return @{
    @"hasResult": @YES,
    @"result": @{
      @"type": [NSString stringWithUTF8String:result.core.gestureName.c_str()],
      @"gestureName": [NSString stringWithUTF8String:result.core.gestureName.c_str()],
      @"intent": [NSString stringWithUTF8String:octatouch::to_string(result.core.intent).c_str()],
      @"fallbackIntent": [NSString stringWithUTF8String:octatouch::to_string(result.core.fallbackIntent).c_str()],
      @"blocked": @(result.core.blocked),
      @"userMessage": [NSString stringWithUTF8String:result.core.userMessage.c_str()],
      @"confidence": @(result.core.confidence),
      @"activeFingers": fingerSetToNSArray(result.core.activeFingers),
      @"resolvedAt_us": @(result.core.resolvedAt_us),
      @"diagnostics": @{
        @"durationMs": @(result.diagnostics.durationMs),
        @"travelX": @(result.diagnostics.travelX),
        @"travelY": @(result.diagnostics.travelY),
        @"peakTouches": @(result.diagnostics.peakTouches),
        @"startedAt_us": @(result.diagnostics.startedAt_us),
        @"endedAt_us": @(result.diagnostics.endedAt_us),
      },
    },
    @"live": live,
  };
}
}  // namespace

@interface OctaTouchEngineHost () {
  std::unique_ptr<RealtimeGestureEngine> _engine;
}
@end

@implementation OctaTouchEngineHost

- (instancetype)init {
  self = [super init];
  if (self) {
    _engine = std::make_unique<RealtimeGestureEngine>();
  }
  return self;
}

- (NSDictionary *)getCapabilities {
  CapabilityFlags flags{};
  return @{
    @"engineMode": @"native-sync",
    @"transport": @"expo-module",
    @"platform": @"ios",
    @"usesCppCore": @YES,
    @"capabilities": capabilitiesToDictionary(flags),
  };
}

- (NSDictionary *)ingestFrame:(NSDictionary *)frame context:(NSDictionary *)context {
  const auto nativeFrame = parseFrame(frame);
  const auto nativeContext = parseContext(context);
  return responseToDictionary(_engine->ingestFrame(nativeFrame, nativeContext));
}

- (void)reset {
  _engine->reset();
}

@end
