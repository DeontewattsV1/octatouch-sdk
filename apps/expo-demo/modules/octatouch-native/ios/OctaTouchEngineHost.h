#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OctaTouchEngineHost : NSObject

- (NSDictionary *)getCapabilities;
- (NSDictionary *)ingestFrame:(NSDictionary *)frame context:(NSDictionary *)context;
- (void)reset;

@end

NS_ASSUME_NONNULL_END
