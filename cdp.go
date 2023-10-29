package gocdp

import (
	"errors"
	"fmt"
	"io"
	"os"
)

var c *CDP
var errNoParser = errors.New("no parser found")

var defaultParsers = []Parser{
	FfufParser{},
	GobusterParser{},
	DirbParser{},
	FeroxbusterParser{},
	DirSearchParser{},
}

type Option func(*CDP)

// FailNoParserErrs will enable failing when no parser is found when parsing multiple files
func FailNoParserErrs() Option {
	return func(c *CDP) {
		c.failNoParserErr = true
	}
}

// DefaultParsers sets the default parsers used when no parser is specified
func DefaultParsers(parsers ...Parser) Option {
	return func(c *CDP) {
		c.defaultParsers = parsers
	}
}

type CDP struct {
	defaultParsers  []Parser
	failNoParserErr bool
}

func New(options ...Option) *CDP {
	cdp := &CDP{}
	for _, option := range options {
		option(cdp)
	}

	if len(cdp.defaultParsers) == 0 {
		cdp.defaultParsers = defaultParsers
	}

	return cdp
}

func (cdp *CDP) SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	var allResults CDResults
	for _, file := range files {
		results, err := cdp.SmartParseFile(file, parsers...)
		if err != nil {
			if err == errNoParser {
				if cdp.failNoParserErr {
					return nil, fmt.Errorf("no parser found for file '%s'", file)
				}
				continue
			}
			return nil, err
		}

		allResults = append(allResults, results...)
	}
	return allResults, nil
}

func (cdp *CDP) SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return cdp.SmartParse(f, parsers...)
}

func (cdp *CDP) SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if len(parsers) == 0 {
		parsers = cdp.defaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return nil, errNoParser
	}

	output, err := parser.Parse(input)
	if err != nil {
		return nil, err
	}
	return output, nil
}

func SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFiles(files, parsers...)
}

func SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFile(file, parsers...)
}

func SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	return c.SmartParse(reader, parsers...)
}

func (cdp *CDP) SmartTrimFiles(files []string, opts []TrimOption, parsers ...Parser) error {
	for _, file := range files {
		err := cdp.SmartTrimFile(file, opts, parsers...)
		if err != nil {
			if err == errNoParser {
				if cdp.failNoParserErr {
					return fmt.Errorf("no trimmer found for file '%s'", file)
				}
				continue
			}
			return err
		}
	}
	return nil
}

func (cdp *CDP) SmartTrimFile(file string, opts []TrimOption, parsers ...Parser) error {
	f, err := os.Open(file)
	if err != nil {
		return err
	}

	output, err := cdp.SmartTrim(f, opts, parsers...)
	if err != nil {
		return err
	}

	err = f.Close()
	if err != nil {
		return err
	}

	return os.WriteFile(file, []byte(output), 0644)
}

func (cdp *CDP) SmartTrim(reader io.Reader, opts []TrimOption, parsers ...Parser) (string, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}

	if len(parsers) == 0 {
		parsers = cdp.defaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanTransform() && p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return "", errNoParser
	}

	results, err := parser.Parse(input)
	if err != nil {
		return "", err
	}

	options := &TrimOptions{
		filters:  make([]func(CDResult) bool, 0),
		operator: OrOperator,
	}

	for _, o := range opts {
		o(options)
	}

	statusCounts := make(map[int]int)

	var filtered []interface{}
	for _, result := range results {
		isFiltered := false
		if options.operator == AndOperator {
			isFiltered = true
		}

		for _, filter := range options.filters {
			if filter(result) {
				if options.operator == OrOperator {
					isFiltered = true
					break
				}
			} else if options.operator == AndOperator {
				isFiltered = false
				break
			}
		}

		if !isFiltered && options.maxResults > 0 {
			isFiltered = statusCounts[result.Status] >= options.maxResults
		}

		if !isFiltered {
			statusCounts[result.Status] += 1
			filtered = append(filtered, result.source)
		}
	}

	output, err := parser.Transform(input, filtered)
	if err != nil {
		return "", err
	}
	return output, nil
}

func SmartTrimFiles(files []string, opts []TrimOption, parsers ...Parser) error {
	return c.SmartTrimFiles(files, opts, parsers...)
}

func SmartTrimFile(file string, opts []TrimOption, parsers ...Parser) error {
	return c.SmartTrimFile(file, opts, parsers...)
}

func SmartTrim(reader io.Reader, opts []TrimOption, parsers ...Parser) (string, error) {
	return c.SmartTrim(reader, opts, parsers...)
}

func init() {
	c = New()
}
