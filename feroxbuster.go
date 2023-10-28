package gocdp

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/iancoleman/orderedmap"
)

var (
	feroxTextRegex *regexp.Regexp = regexp.MustCompile(`^(?P<status>[0-9]+)\s*(?P<method>[^ ]+)\s*(?P<lines>[0-9]+)l\s*(?P<words>[0-9]+)w\s*(?P<length>[0-9]+)c\s*(?P<url>[^ ]+)(?:\s*=>\s*(?P<redirect>[^ ]+))?$`)
)

type feroxResult struct {
	Type          string            `json:"type"`
	URL           string            `json:"url"`
	Status        int               `json:"status"`
	ContentLength int               `json:"content_length"`
	Headers       map[string]string `json:"headers"`

	raw         interface{}
	redirect    string
	contentType string
}

type _feroxResult feroxResult

func (f *feroxResult) UnmarshalJSON(bytes []byte) (err error) {
	foo := _feroxResult{}

	if err = json.Unmarshal(bytes, &foo); err == nil {
		*f = feroxResult(foo)
	}

	m := orderedmap.New()

	if err = json.Unmarshal(bytes, &m); err == nil {
		f.raw = m

		if redirect, ok := foo.Headers["location"]; ok {
			f.redirect = redirect
		}

		if contentType, ok := foo.Headers["content-type"]; ok {
			f.contentType = contentType
		}
	}

	return err
}

type FeroxbusterParser struct {
}

func (FeroxbusterParser) isTextResult(line string) bool {
	return feroxTextRegex.MatchString(line)
}

func (FeroxbusterParser) isJSONResult(line string) bool {
	var result feroxResult
	err := json.Unmarshal([]byte(line), &result)
	if err != nil {
		return false
	}

	return result.URL != ""
}

func (FeroxbusterParser) parseJSON(input string) (CDResults, error) {
	var results CDResults

	scanner := bufio.NewScanner(strings.NewReader(input))
	for scanner.Scan() {
		var result feroxResult
		err := json.Unmarshal(scanner.Bytes(), &result)
		if err != nil {
			return nil, err
		}

		if result.Type != "response" {
			continue
		}

		results = append(results, CDResult{
			Url:           result.URL,
			Status:        result.Status,
			Redirect:      result.redirect,
			ContentType:   result.contentType,
			ContentLength: result.ContentLength,
			source:        result.raw,
		})
	}

	return results, nil
}

func (FeroxbusterParser) parseText(input string) (CDResults, error) {
	var results CDResults
	scanner := bufio.NewScanner(strings.NewReader(input))
	for scanner.Scan() {
		line := scanner.Text()
		match := feroxTextRegex.FindStringSubmatch(line)
		if len(match) == 0 {
			continue
		}

		namedMatches := make(map[string]string)
		for j, name := range feroxTextRegex.SubexpNames() {
			if j != 0 && name != "" {
				namedMatches[name] = match[j]
			}
		}

		status, _ := strconv.Atoi(namedMatches["status"])
		length, _ := strconv.Atoi(namedMatches["length"])

		result := CDResult{
			Url:           namedMatches["url"],
			Status:        status,
			ContentType:   "",
			ContentLength: length,
			source:        line,
		}

		if result.IsRedirect() {
			result.Redirect = namedMatches["redirect"]
		}

		results = append(results, result)
	}

	return results, nil
}

func (p FeroxbusterParser) Parse(input string) (CDResults, error) {
	line := strings.Split(input, "\n")[0]
	if p.isJSONResult(line) {
		return p.parseJSON(input)
	}

	return p.parseText(input)
}

func (p FeroxbusterParser) CanParse(input string) bool {
	line := strings.Split(input, "\n")[0]
	return p.isJSONResult(line) || p.isTextResult(line)
}

func (p FeroxbusterParser) CanTransform() bool {
	return true
}

func (p FeroxbusterParser) exportJSON(filtered []interface{}) (string, error) {
	writer := bytes.NewBuffer(nil)

	for _, line := range filtered {
		bytes, err := json.Marshal(line)
		if err != nil {
			return "", err
		}

		writer.WriteString(fmt.Sprintln(string(bytes)))
	}

	return writer.String(), nil
}

func (p FeroxbusterParser) exportText(filtered []interface{}) (string, error) {
	writer := bytes.NewBuffer(nil)

	for _, line := range filtered {
		writer.WriteString(fmt.Sprintln(line))
	}

	return writer.String(), nil
}

func (p FeroxbusterParser) Transform(input string, filtered []interface{}) (string, error) {
	line := strings.Split(input, "\n")[0]
	if p.isJSONResult(line) {
		return p.exportJSON(filtered)
	}

	return p.exportText(filtered)
}
