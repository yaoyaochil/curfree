package service

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

var app *application.App

type AppService struct{}

func SetApp(a *application.App) {
	app = a
}

func (s *AppService) QuitApp() {
	if app != nil {
		app.Quit()
	}
}
