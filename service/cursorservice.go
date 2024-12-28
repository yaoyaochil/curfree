package service

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"runtime"
	"strings"
)

type CursorService struct{}

type CursorConfig struct {
	MachineId    string `json:"telemetry.machineId"`
	MacMachineId string `json:"telemetry.macMachineId"`
	DevDeviceId  string `json:"telemetry.devDeviceId"`
	SqmId        string `json:"telemetry.sqmId"`
	IsReadOnly   bool   `json:"isReadOnly"`
	ConfigPath   string `json:"configPath"`
}

func (c *CursorService) GetCursorStorage() CursorConfig {
	currentUser, err := user.Current()
	if err != nil {
		return CursorConfig{}
	}

	var path string
	switch runtime.GOOS {
	case "darwin":
		path = filepath.Join(currentUser.HomeDir, "Library", "Application Support", "Cursor", "User", "globalStorage", "storage.json")
	case "windows":
		path = filepath.Join(currentUser.HomeDir, "AppData", "Roaming", "Cursor", "User", "globalStorage", "storage.json")
	default:
		path = filepath.Join(currentUser.HomeDir, ".cursor", "storage.json")
	}
	return readCursorConfig(path)
}

func readCursorConfig(path string) CursorConfig {
	data, err := os.ReadFile(path)
	if err != nil {
		return CursorConfig{}
	}

	var config CursorConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return CursorConfig{}
	}
	config.ConfigPath = path
	config.IsReadOnly = IsCursorConfigReadOnly(path)
	return config
}

func IsCursorConfigReadOnly(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}
	if runtime.GOOS != "windows" {
		return fileInfo.Mode().Perm()&0200 == 0
	}
	return fileInfo.Mode().Perm()&0222 == 0
}

func (c *CursorService) SetCursorConfigReadOnly(path string, isReadOnly bool) bool {
	if path == "" {
		return false
	}

	if isReadOnly {
		return os.Chmod(path, 0444) == nil
	}
	return os.Chmod(path, 0644) == nil
}

// GenerateUUID 生成标准的 UUID
func GenerateUUID() string {
	uuid := make([]byte, 16)
	rand.Read(uuid)

	// 设置版本 (4) 和变体位
	uuid[6] = (uuid[6] & 0x0f) | 0x40 // 版本 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // RFC 4122 变体

	return fmt.Sprintf("%x-%x-%x-%x-%x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16])
}

// GenerateMachineID 生成32字节的机器ID
func GenerateMachineID() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)

	var hexString strings.Builder
	for _, b := range bytes {
		hexString.WriteString(fmt.Sprintf("%02x", b))
	}

	return hexString.String()
}

// GenerateSqmID 生成带大括号的UUID格式
func GenerateSqmID() string {
	return fmt.Sprintf("{%s}", strings.ToUpper(GenerateUUID()))
}

// 重置Cursor Storage 将storage.json 四个字段替换新的数据
func (c *CursorService) ResetCursorStorage(path string) bool {
	if path == "" {
		return false
	}

	// 1. 读取当前配置
	currentConfig := readCursorConfig(path)
	if currentConfig.ConfigPath == "" {
		return false
	}

	// 2. 备份当前文件
	backupPath := path + ".back"
	currentData, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	if err := os.WriteFile(backupPath, currentData, 0644); err != nil {
		return false
	}

	// 3. 生成新的配置数据
	newConfig := CursorConfig{
		MachineId:    GenerateMachineID(),
		MacMachineId: GenerateUUID(),
		DevDeviceId:  GenerateUUID(),
		SqmId:        GenerateSqmID(),
		ConfigPath:   path,
		IsReadOnly:   currentConfig.IsReadOnly,
	}

	// 4. 将新配置写入文件
	newData, err := json.MarshalIndent(newConfig, "", "    ")
	if err != nil {
		return false
	}

	// 5. 保持原有的文件权限
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}
	originalMode := fileInfo.Mode()

	// 6. 写入新配置
	if err := os.WriteFile(path, newData, originalMode.Perm()); err != nil {
		// 如果写入失败，尝试恢复备份
		os.WriteFile(path, currentData, originalMode.Perm())
		return false
	}

	return true
}

// BackupCursorStorage 备份Cursor Storage 将storage.json 备份到 backup.json
func (c *CursorService) BackupCursorStorage(path string) bool {
	if path == "" {
		return false
	}

	// 1. 读取当前配置
	currentConfig := readCursorConfig(path)
	if currentConfig.ConfigPath == "" {
		return false
	}

	// 2. 备份当前文件
	backupPath := path + ".back"
	currentData, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	if err := os.WriteFile(backupPath, currentData, 0644); err != nil {
		return false
	}

	return true
}

// RestoreCursorStorage 从备份文件恢复配置
func (c *CursorService) RestoreCursorStorage(path string) bool {
	if path == "" {
		return false
	}

	// 是否只读
	isReadOnly := IsCursorConfigReadOnly(path)
	if isReadOnly {
		return false
	}

	// 1. 检查备份文件是否存在
	backupPath := path + ".back"
	backupData, err := os.ReadFile(backupPath)
	if err != nil {
		return false
	}

	// 2. 验证备份文件是否是有效的配置
	var backupConfig CursorConfig
	if err := json.Unmarshal(backupData, &backupConfig); err != nil {
		return false
	}

	// 3. 保持原有的文件权限
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}
	originalMode := fileInfo.Mode()

	// 4. 写入恢复的配置
	if err := os.WriteFile(path, backupData, originalMode.Perm()); err != nil {
		return false
	}

	return true
}
