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

class ScratchpadHUD: NSPanel, NSTextViewDelegate {
    var textView: NSTextView?
    var lastSavedContent: String = ""
    let notesAppPath = "/tmp/engress_notes.txt"
    let notesHudPath = "/tmp/engress_notes_hud.txt"

    init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.borderless, .resizable, .nonactivatingPanel],
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
        
        // Background
        let visualEffect = NSVisualEffectView(frame: NSRect(origin: .zero, size: contentRect.size))
        visualEffect.material = .hudWindow
        visualEffect.blendingMode = .behindWindow
        visualEffect.state = .active
        visualEffect.wantsLayer = true
        visualEffect.layer?.cornerRadius = 20
        visualEffect.layer?.borderWidth = 1.0
        visualEffect.layer?.borderColor = NSColor.white.withAlphaComponent(0.1).cgColor
        visualEffect.autoresizingMask = [.width, .height]
        self.contentView = visualEffect
        
        // Header Info
        let label = NSTextField(frame: NSRect(x: 20, y: contentRect.height - 35, width: 200, height: 20))
        label.isEditable = false
        label.isBordered = false
        label.backgroundColor = .clear
        label.textColor = NSColor.white.withAlphaComponent(0.3)
        label.stringValue = "SCRATCHPAD & NOTES"
        label.font = NSFont.systemFont(ofSize: 10, weight: .black)
        label.autoresizingMask = [.minYMargin]
        visualEffect.addSubview(label)
        
        // Close Button
        let closeBtn = NSButton(frame: NSRect(x: contentRect.width - 40, y: contentRect.height - 35, width: 24, height: 24))
        closeBtn.title = "✕"
        closeBtn.bezelStyle = .recessed
        closeBtn.isBordered = false
        closeBtn.target = self
        closeBtn.action = #selector(hideMe)
        closeBtn.autoresizingMask = [.minXMargin, .minYMargin]
        visualEffect.addSubview(closeBtn)

        // Scroll View & Text View
        let scrollView = NSScrollView(frame: NSRect(x: 10, y: 10, width: contentRect.width - 20, height: contentRect.height - 50))
        scrollView.hasVerticalScroller = true
        scrollView.drawsBackground = false
        scrollView.autoresizingMask = [.width, .height]
        
        textView = NSTextView(frame: scrollView.bounds)
        textView?.isEditable = true
        textView?.isSelectable = true
        textView?.delegate = self
        textView?.backgroundColor = .clear
        textView?.textColor = .white
        textView?.insertionPointColor = .white
        textView?.font = NSFont.systemFont(ofSize: 13, weight: .medium)
        textView?.drawsBackground = false
        
        scrollView.documentView = textView
        visualEffect.addSubview(scrollView)
    }

    override var canBecomeKey: Bool { return true }
    override var canBecomeMain: Bool { return true }
    
    @objc func hideMe() {
        AppDelegate.shared?.sendCommand("HIDE_SCRATCHPAD")
        self.alphaValue = 0.0
    }
    
    func textDidChange(_ notification: Notification) {
        let content = textView?.string ?? ""
        if content != lastSavedContent {
            lastSavedContent = content
            try? content.write(toFile: notesHudPath, atomically: true, encoding: .utf8)
        }
    }
    
    func updateContent(from file: String) {
        // Don't pull updates from the app while the user is typing in the HUD
        if self.isKeyWindow { return }
        
        if let content = try? String(contentsOfFile: file, encoding: .utf8), content != textView?.string {
            let selectedRange = textView?.selectedRange()
            textView?.string = content
            lastSavedContent = content
            if let range = selectedRange, range.location + range.length <= content.count {
                textView?.setSelectedRange(range)
            }
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    static var shared: AppDelegate?
    
    var timerWindow: EngressHUD?
    var scratchWindow: ScratchpadHUD?
    
    var timer: Timer?
    var timerLabel: NSTextField?
    var sessionLabel: NSTextField?
    var pauseButton: NSButton?
    var stopButton: NSButton?
    
    let timerPath = "/tmp/sentinel_timer.txt"
    let cmdPath = "/tmp/engress_cmd.txt"
    let notesAppPath = "/tmp/engress_notes.txt"

    func applicationDidFinishLaunching(_ notification: Notification) {
        let screen = NSScreen.main?.frame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        
        // 1. Timer Window Setup
        let tRect = NSRect(x: screen.width - 250, y: screen.height - 100, width: 230, height: 64)
        timerWindow = EngressHUD(contentRect: tRect)
        setupTimerUI(in: timerWindow!)
        
        // 2. Scratchpad Window Setup
        let sRect = NSRect(x: screen.width - 420, y: screen.height - 520, width: 400, height: 400)
        scratchWindow = ScratchpadHUD(contentRect: sRect)
        scratchWindow?.alphaValue = 0.0
        
        timerWindow?.makeKeyAndOrderFront(nil)
        scratchWindow?.makeKeyAndOrderFront(nil)
        
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            self.updateData()
        }
    }

    func setupTimerUI(in window: EngressHUD) {
        sessionLabel = NSTextField(frame: NSRect(x: 15, y: 38, width: 140, height: 20))
        sessionLabel?.isEditable = false
        sessionLabel?.isBordered = false
        sessionLabel?.backgroundColor = .clear
        sessionLabel?.textColor = NSColor.white.withAlphaComponent(0.4)
        sessionLabel?.alignment = .left
        sessionLabel?.font = NSFont.systemFont(ofSize: 9, weight: .bold)
        sessionLabel?.stringValue = "FOCUS MODE"
        
        timerLabel = NSTextField(frame: NSRect(x: 12, y: 8, width: 110, height: 40))
        timerLabel?.isEditable = false
        timerLabel?.isBordered = false
        timerLabel?.backgroundColor = .clear
        timerLabel?.textColor = .white
        timerLabel?.alignment = .left
        timerLabel?.font = NSFont.monospacedDigitSystemFont(ofSize: 28, weight: .bold)
        timerLabel?.stringValue = "0:00"
        
        let clickGesture = NSClickGestureRecognizer(target: self, action: #selector(openApp))
        timerLabel?.addGestureRecognizer(clickGesture)
        
        let btnContainer = NSView(frame: NSRect(x: 125, y: 0, width: 100, height: 64))
        pauseButton = createCircularButton(iconName: "pause.fill", frame: NSRect(x: 5, y: 14, width: 36, height: 36), action: #selector(togglePause))
        stopButton = createCircularButton(iconName: "stop.fill", frame: NSRect(x: 48, y: 14, width: 36, height: 36), action: #selector(stopSession))
        stopButton?.contentTintColor = .systemRed

        window.contentView?.addSubview(sessionLabel!)
        window.contentView?.addSubview(timerLabel!)
        btnContainer.addSubview(pauseButton!)
        btnContainer.addSubview(stopButton!)
        window.contentView?.addSubview(btnContainer)
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

    @objc func togglePause() { sendCommand("TOGGLE_PAUSE") }
    @objc func stopSession() { sendCommand("STOP") }
    @objc func openApp() { sendCommand("OPEN") }

    public func sendCommand(_ cmd: String) {
        try? cmd.write(toFile: cmdPath, atomically: true, encoding: .utf8)
    }

    func updateData() {
        do {
            let content = try String(contentsOfFile: timerPath, encoding: .utf8)
            let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
            let parts = trimmed.components(separatedBy: "|")
            
            let isHidden = trimmed.isEmpty || 
                           trimmed.uppercased().contains("HIDDEN") || 
                           (parts.count > 0 && parts[0].trimmingCharacters(in: .whitespacesAndNewlines).uppercased() == "HIDDEN")
            
            if isHidden {
                timerWindow?.alphaValue = 0.0
                scratchWindow?.alphaValue = 0.0
                timerWindow?.setIsVisible(false)
                scratchWindow?.setIsVisible(false)
                return
            }
            
            timerWindow?.setIsVisible(true)
            timerWindow?.alphaValue = 1.0
            timerLabel?.stringValue = parts[0]
            
            if parts.count > 1 && !parts[1].isEmpty {
                sessionLabel?.stringValue = parts[1].uppercased()
            }
            
            if parts.count > 2 {
                let scratchVisible = parts[2] == "1"
                if scratchVisible {
                    scratchWindow?.setIsVisible(true)
                    scratchWindow?.orderFrontRegardless()
                    scratchWindow?.alphaValue = 1.0
                    scratchWindow?.updateContent(from: notesAppPath)
                } else {
                    scratchWindow?.alphaValue = 0.0
                    scratchWindow?.setIsVisible(false)
                }
            }
        } catch {
            timerWindow?.alphaValue = 0.0
            scratchWindow?.alphaValue = 0.0
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
AppDelegate.shared = delegate
app.delegate = delegate
app.run()
