package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

type noopWriter struct {
}

func (w noopWriter) Write(bytes []byte) (int, error) {
	return 0, nil
}

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "gocdp files...",
	Short: "Content discovery parser",
	Args:  cobra.MinimumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		results, err := gocdp.SmartParseFiles(args)
		if err != nil {
			return err
		}

		query, _ := cmd.Flags().GetString("query")
		if query != "" {
			var filteredResults gocdp.CDResults
			filterTemplate := template.New("filter")
			funcMap := make(template.FuncMap)
			funcMap["appendMatch"] = func(match gocdp.CDResult) string {
				filteredResults = append(filteredResults, match)
				return ""
			}

			templateString := fmt.Sprintf(`{{range $result := .}}{{if %s}}{{appendMatch $result}}{{end}}{{end}}`, query)
			_, err := filterTemplate.Funcs(funcMap).Parse(templateString)
			if err != nil {
				return err
			}

			err = filterTemplate.Execute(noopWriter{}, results)
			if err != nil {
				return err
			}
			results = filteredResults
		}

		group, _ := cmd.Flags().GetBool("group")
		format, _ := cmd.Flags().GetString("format")
		if format != "" {
			formatTemplate, err := template.New("format").Parse(format)
			if err != nil {
				return err
			}

			for _, result := range results {
				buf := new(bytes.Buffer)
				err = formatTemplate.Execute(buf, result)
				if err != nil {
					return err
				}
				fmt.Println(buf.String())
			}
		} else if group {
			grouped := results.GroupByStatus()

			data, err := json.MarshalIndent(grouped, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(data))
		} else {
			data, err := json.MarshalIndent(results, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(data))
		}

		return nil
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	rootCmd.Flags().StringP("format", "f", "", "golang text/template format to be applied on each result")
	rootCmd.Flags().StringP("query", "q", "", "golang text/template used to filter the results")
	rootCmd.Flags().BoolP("group", "g", false, "group the results by status code")
}
