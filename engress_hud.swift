import Cocoa

class EngressHUD: NSPanel {
    init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        self.level = .floating
        self.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        self.backgroundColor = .clear
        self.isOpaque = false
        self.hasShadow = true
        self.isMovableByWindowBackground = true
        self.isReleasedWhenClosed = false
        
        let visualEffect = NSVisualEffectView(frame: NSRect(origin: .zero, size: contentRect.size))
        visualEffect.material = .hudWindow
        visualEffect.blendingMode = .behindWindow
        visualEffect.state = .active
        visualEffect.wantsLayer = true
        visualEffect.layer?.cornerRadius = 24
        visualEffect.layer?.borderWidth = 1.0
        visualEffect.layer?.borderColor = NSColor.white.withAlphaComponent(0.1).cgColor
        self.contentView = visualEffect
    }
}

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    var window: EngressHUD?
    var timer: Timer?
    var timerLabel: NSTextField?
    var sessionLabel: NSTextField?
    var pauseButton: NSButton?
    var stopButton: NSButton?
    
    let timerPath = "/tmp/sentinel_timer.txt"
    let cmdPath = "/tmp/engress_cmd.txt"

    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.run()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        let screen = NSScreen.main?.frame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        // More compact but elegant
        let rect = NSRect(x: screen.width - 250, y: screen.height - 100, width: 230, height: 64)
        
        window = EngressHUD(contentRect: rect)
        
        // Session Type (Dimmest, smallest)
        sessionLabel = NSTextField(frame: NSRect(x: 15, y: 38, width: 140, height: 20))
        sessionLabel?.isEditable = false
        sessionLabel?.isBordered = false
        sessionLabel?.backgroundColor = .clear
        sessionLabel?.textColor = NSColor.white.withAlphaComponent(0.4)
        sessionLabel?.alignment = .left
        sessionLabel?.font = NSFont.systemFont(ofSize: 9, weight: .bold)
        sessionLabel?.stringValue = "FOCUS MODE"
        
        // Timer Label (Primary)
        timerLabel = NSTextField(frame: NSRect(x: 12, y: 8, width: 110, height: 40))
        timerLabel?.isEditable = false
        timerLabel?.isBordered = false
        timerLabel?.backgroundColor = .clear
        timerLabel?.textColor = .white
        timerLabel?.alignment = .left
        timerLabel?.font = NSFont.monospacedDigitSystemFont(ofSize: 28, weight: .bold)
        timerLabel?.stringValue = "0:00"
        
        // Interaction: Click label to open app
        let clickGesture = NSClickGestureRecognizer(target: self, action: #selector(openApp))
        timerLabel?.addGestureRecognizer(clickGesture)
        
        // Buttons Container (Right Side)
        let btnContainer = NSView(frame: NSRect(x: 125, y: 0, width: 100, height: 64))
        
        // Pause Button - Circular
        pauseButton = createCircularButton(iconName: "pause.fill", frame: NSRect(x: 5, y: 14, width: 36, height: 36), action: #selector(togglePause))
        
        // Stop Button - Circular
        stopButton = createCircularButton(iconName: "stop.fill", frame: NSRect(x: 48, y: 14, width: 36, height: 36), action: #selector(stopSession))
        stopButton?.contentTintColor = .systemRed

        window?.contentView?.addSubview(sessionLabel!)
        window?.contentView?.addSubview(timerLabel!)
        btnContainer.addSubview(pauseButton!)
        btnContainer.addSubview(stopButton!)
        window?.contentView?.addSubview(btnContainer)
        
        window?.makeKeyAndOrderFront(nil)
        window?.orderFrontRegardless()
        
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            self.updateData()
        }
    }

    func createCircularButton(iconName: String, frame: NSRect, action: Selector) -> NSButton {
        let btn = NSButton(frame: frame)
        btn.bezelStyle = .recessed
        btn.isBordered = false
        btn.title = ""
        if #available(OSX 11.0, *) {
            let config = NSImage.SymbolConfiguration(pointSize: 14, weight: .bold)
            btn.image = NSImage(systemSymbolName: iconName, accessibilityDescription: nil)?.withSymbolConfiguration(config)
        }
        btn.target = self
        btn.action = action
        btn.wantsLayer = true
        btn.layer?.cornerRadius = frame.width / 2
        btn.layer?.backgroundColor = NSColor.white.withAlphaComponent(0.08).cgColor
        return btn
    }

    @objc func togglePause() {
        sendCommand("TOGGLE_PAUSE")
    }

    @objc func stopSession() {
        sendCommand("STOP")
    }
    
    @objc func openApp() {
        sendCommand("OPEN")
    }

    func sendCommand(_ cmd: String) {
        try? cmd.write(toFile: cmdPath, atomically: true, encoding: .utf8)
    }

    func updateData() {
        do {
            let content = try String(contentsOfFile: timerPath, encoding: .utf8)
            let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
            
            if trimmed == "HIDDEN" || trimmed.isEmpty {
                window?.alphaValue = 0.0
                return
            }
            
            window?.alphaValue = 1.0
            
            let parts = trimmed.components(separatedBy: "|")
            timerLabel?.stringValue = parts[0]
            
            if parts.count > 1 && !parts[1].isEmpty {
                let text = parts[1].uppercased()
                sessionLabel?.stringValue = text
                
                if text.contains(">>>") {
                    sessionLabel?.textColor = .systemRed
                    sessionLabel?.font = NSFont.systemFont(ofSize: 10, weight: .black)
                } else {
                    sessionLabel?.textColor = NSColor.white.withAlphaComponent(0.4)
                    sessionLabel?.font = NSFont.systemFont(ofSize: 9, weight: .bold)
                }
            } else {
                sessionLabel?.stringValue = "FOCUS MODE"
                sessionLabel?.textColor = NSColor.white.withAlphaComponent(0.4)
            }
            
        } catch {
            window?.alphaValue = 0.0
        }
    }
}
