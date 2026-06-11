import ExpoModulesCore

public final class OctaTouchNativeModule: Module {
  private let host = OctaTouchEngineHost()

  public func definition() -> ModuleDefinition {
    Name("OctaTouchNative")

    Function("getCapabilities") {
      host.getCapabilities()
    }

    Function("ingestFrame") { (frame: [String: Any], context: [String: Any]) in
      host.ingestFrame(frame, context: context)
    }

    Function("reset") {
      host.reset()
    }
  }
}
