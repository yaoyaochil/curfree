package main

import (
	"embed"
	"log"
	"runtime"

	"github.com/yaoyaochil/curfree-wails3/service"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/icons"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "curfree",
		Description: "cursor tools",
		Services: []application.Service{
			application.NewService(&service.CursorService{}),
			application.NewService(&service.GreetService{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ActivationPolicy: application.ActivationPolicyAccessory,
		},
	})

	// Create a new system tray
	systemTray := app.NewSystemTray()

	// Create a hidden window
	window := app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:     "curfree",
		Width:     650,
		Height:    580,
		Frameless: true,
		// AlwaysOnTop:   true, // 设置窗口始终置顶 在Hidden=true时 不可使用 原因会和托盘冲突
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

	// macOS uses template icons
	if runtime.GOOS == "darwin" {
		systemTray.SetTemplateIcon(icons.SystrayMacTemplate)
	} else {
		// Other platforms use light/dark mode icons
		systemTray.SetDarkModeIcon(icons.SystrayDark)
		systemTray.SetIcon(icons.SystrayLight)
	}

	// Attach the window to the system tray icon
	systemTray.AttachWindow(window).WindowOffset(5)

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	// go func() {
	// 	for {
	// 		now := time.Now().Format(time.RFC1123)
	// 		app.EmitEvent("time", now)
	// 		time.Sleep(time.Second)
	// 	}
	// }()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
