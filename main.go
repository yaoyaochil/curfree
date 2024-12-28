package main

import (
	"embed"
	"log"

	"github.com/yaoyaochil/curfree-wails3/service"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var trayIcon []byte

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {
	// Create application instance
	app := application.New(application.Options{
		Name:        "curfree",
		Description: "cursor tools",
		Services: []application.Service{
			application.NewService(&service.CursorService{}),
			application.NewService(&service.GreetService{}),
			application.NewService(&service.AppService{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ActivationPolicy: application.ActivationPolicyAccessory,
		},
	})

	// Set app instance for AppService
	service.SetApp(app)

	// Create a new system tray
	systemTray := app.NewSystemTray()

	// Create a hidden window
	window := app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:     "curfree",
		Width:     700,
		Height:    610,
		Frameless: true,
		// AlwaysOnTop:   true, // 设置窗口始终置顶 在Hidden=true时 不可使用 原因会和盘冲突
		Hidden:        true,
		DisableResize: true,
		// Hide the window instead of exiting when the close button is clicked
		ShouldClose: func(window *application.WebviewWindow) bool {
			window.Hide()
			return false
		},
		Windows: application.WindowsWindow{
			HiddenOnTaskbar: true,
		},
		BackgroundType: application.BackgroundTypeTransparent,
		URL:            "/",
	})

	// Set custom tray icon
	systemTray.SetIcon(trayIcon)

	// Attach the window to the system tray icon
	systemTray.AttachWindow(window).WindowOffset(5)

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
